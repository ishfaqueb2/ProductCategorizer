import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { insertProcessSessionSchema, insertProductSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

const upload = multer({ storage: multer.memoryStorage() });

interface ParsedData {
  headers: string[];
  rows: any[];
}

function parseCSV(buffer: Buffer): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const text = buffer.toString("utf-8");
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({ headers, rows: results.data });
      },
      error: (error: Error) => reject(error),
    });
  });
}

function parseXLSX(buffer: Buffer): ParsedData {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(worksheet);
  const headers = data.length > 0 ? Object.keys(data[0] as object) : [];
  return { headers, rows: data };
}

async function parseFile(file: Express.Multer.File): Promise<ParsedData> {
  const ext = file.originalname.split(".").pop()?.toLowerCase();
  
  if (ext === "csv") {
    return parseCSV(file.buffer);
  } else if (ext === "xlsx" || ext === "xls") {
    return parseXLSX(file.buffer);
  } else {
    throw new Error("Unsupported file format. Use CSV or XLSX.");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/upload/product", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const parsed = await parseFile(req.file);
      res.json({
        filename: req.file.originalname,
        headers: parsed.headers,
        rowCount: parsed.rows.length,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/upload/taxonomy", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const parsed = await parseFile(req.file);
      res.json({
        filename: req.file.originalname,
        categories: parsed.rows,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/sessions", upload.fields([
    { name: "productFile", maxCount: 1 },
    { name: "taxonomyFile", maxCount: 1 },
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.productFile || !files.taxonomyFile) {
        return res.status(400).json({ error: "Both product and taxonomy files required" });
      }

      const productFile = files.productFile[0];
      const taxonomyFile = files.taxonomyFile[0];
      const { columnMappings, confidenceThreshold } = req.body;

      const parsedProducts = await parseFile(productFile);
      const parsedTaxonomy = await parseFile(taxonomyFile);

      const mappings = JSON.parse(columnMappings);

      const session = await storage.createSession({
        productFileName: productFile.originalname,
        taxonomyFileName: taxonomyFile.originalname,
        confidenceThreshold: parseFloat(confidenceThreshold) || 0.7,
        columnMappings: mappings,
        totalProducts: parsedProducts.rows.length,
      });

      const productInserts = parsedProducts.rows.map((row: any) => ({
        sessionId: session.id,
        productId: row[mappings.id] || "",
        name: row[mappings.name] || "",
        brand: row[mappings.brand] || null,
        description: row[mappings.description] || null,
        images: mappings.images && row[mappings.images] ? [row[mappings.images]] : null,
        status: "pending",
      }));

      await storage.createProducts(productInserts);
      await storage.saveTaxonomy(session.id, parsedTaxonomy.rows);

      res.json({
        sessionId: session.id,
        totalProducts: parsedProducts.rows.length,
        taxonomy: parsedTaxonomy.rows,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/sessions/:sessionId/categorize", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { apiKey } = req.body;

      if (!apiKey) {
        return res.status(400).json({ error: "API key required" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const taxonomy = await storage.getTaxonomy(sessionId);
      if (!taxonomy) {
        return res.status(400).json({ error: "Taxonomy not found for this session" });
      }

      const products = await storage.getProductsBySession(sessionId);
      const genAI = new GoogleGenAI({ apiKey });

      const CHUNK_SIZE = 50;
      const chunks = [];
      for (let i = 0; i < products.length; i += CHUNK_SIZE) {
        chunks.push(products.slice(i, i + CHUNK_SIZE));
      }

      await storage.updateSessionStatus(sessionId, "processing");

      let processedCount = 0;
      let failedChunks = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        const taxonomyList = taxonomy.map((t: any) => `${t.id}: ${t.path}`).join("\n");
        
        const prompt = `You are a product categorization AI. Categorize each product into the most appropriate taxonomy category.

Available Taxonomy Categories:
${taxonomyList}

Products to categorize:
${chunk.map((p) => `Product ID: ${p.productId}\nName: ${p.name}\nBrand: ${p.brand || "N/A"}\nDescription: ${p.description || "N/A"}\n`).join("\n---\n")}

Return a JSON array with one object per product:
[
  {
    "productId": "exact product ID from above",
    "taxonomyId": "matching taxonomy ID",
    "taxonomyPath": "full category path",
    "confidenceScore": 0.95
  }
]

Return ONLY valid JSON, no markdown or extra text.`;

        try {
          console.log(`Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} products`);
          
          const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          const responseText = result.text || "";
          
          console.log(`Received AI response (${responseText.length} chars)`);
          
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (!jsonMatch) {
            console.error("AI response did not contain JSON array. Response:", responseText.substring(0, 500));
            throw new Error("Invalid response format from AI");
          }
          
          const categorizations = JSON.parse(jsonMatch[0]);
          console.log(`Successfully parsed ${categorizations.length} categorizations`);

          for (const cat of categorizations) {
            const product = chunk.find((p) => p.productId === cat.productId);
            if (product) {
              await storage.updateProduct(product.id, {
                taxonomyId: cat.taxonomyId,
                taxonomyPath: cat.taxonomyPath,
                confidenceScore: cat.confidenceScore,
                status: cat.confidenceScore >= session.confidenceThreshold ? "high-confidence" : "low-confidence",
              });
            }
          }
        } catch (error: any) {
          console.error(`Error processing chunk ${i + 1}:`, error.message);
          console.error("Error stack:", error.stack);
          
          const errorMessage = error.error?.message || error.message || "Unknown error";
          failedChunks++;
          for (const product of chunk) {
            await storage.updateProduct(product.id, {
              status: "error",
              errorMessage: errorMessage,
            });
          }

          if (failedChunks >= chunks.length) {
            console.error("All chunks failed. Failing session.");
            await storage.updateSessionStatus(sessionId, "failed");
            const failedProducts = await storage.getProductsBySession(sessionId);
            return res.status(500).json({
              sessionId,
              status: "failed",
              error: errorMessage,
              products: failedProducts,
            });
          }
        }

        processedCount += chunk.length;
        const actualProgress = Math.min(processedCount, session.totalProducts);
        await storage.updateSessionProgress(sessionId, actualProgress);
      }

      const finalStatus = failedChunks > 0 ? "partial" : "completed";
      await storage.updateSessionStatus(sessionId, finalStatus);
      const finalProducts = await storage.getProductsBySession(sessionId);

      res.json({
        sessionId,
        status: finalStatus,
        products: finalProducts,
      });
    } catch (error: any) {
      const { sessionId } = req.params;
      if (sessionId) {
        await storage.updateSessionStatus(sessionId, "failed");
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const products = await storage.getProductsBySession(sessionId);

      res.json({
        session,
        products,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sessions/:sessionId/export", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { filter, format } = req.query;

      const products = await storage.getProductsBySession(sessionId);
      let filtered = products;

      if (filter === "low-confidence") {
        const session = await storage.getSession(sessionId);
        if (session) {
          filtered = products.filter((p) => 
            p.confidenceScore !== null && p.confidenceScore < session.confidenceThreshold
          );
        }
      }

      const exportData = filtered.map((p) => ({
        product_id: p.productId,
        product_name: p.name,
        brand: p.brand || "",
        description: p.description || "",
        taxonomy_id: p.taxonomyId || "",
        taxonomy_path: p.taxonomyPath || "",
        confidence_score: p.confidenceScore || "",
        status: p.status,
      }));

      if (format === "xlsx") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=products-${sessionId}.xlsx`);
        res.send(buffer);
      } else {
        const csv = Papa.unparse(exportData);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=products-${sessionId}.csv`);
        res.send(csv);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
