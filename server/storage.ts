import { type ProcessSession, type InsertProcessSession, type Product, type InsertProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createSession(session: InsertProcessSession): Promise<ProcessSession>;
  getSession(id: string): Promise<ProcessSession | undefined>;
  updateSessionProgress(id: string, processedProducts: number): Promise<void>;
  updateSessionStatus(id: string, status: string): Promise<void>;
  
  createProduct(product: InsertProduct): Promise<Product>;
  createProducts(products: InsertProduct[]): Promise<Product[]>;
  getProductsBySession(sessionId: string): Promise<Product[]>;
  updateProduct(id: string, updates: Partial<Product>): Promise<void>;
  
  saveTaxonomy(sessionId: string, taxonomy: any[]): Promise<void>;
  getTaxonomy(sessionId: string): Promise<any[] | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, ProcessSession>;
  private products: Map<string, Product>;
  private taxonomies: Map<string, any[]>;

  constructor() {
    this.sessions = new Map();
    this.products = new Map();
    this.taxonomies = new Map();
  }

  async createSession(insertSession: InsertProcessSession): Promise<ProcessSession> {
    const id = randomUUID();
    const session: ProcessSession = {
      ...insertSession,
      id,
      confidenceThreshold: insertSession.confidenceThreshold ?? 0.7,
      processedProducts: 0,
      status: "pending",
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<ProcessSession | undefined> {
    return this.sessions.get(id);
  }

  async updateSessionProgress(id: string, processedProducts: number): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.set(id, { ...session, processedProducts });
    }
  }

  async updateSessionStatus(id: string, status: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.set(id, { ...session, status });
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      brand: insertProduct.brand ?? null,
      description: insertProduct.description ?? null,
      images: insertProduct.images ?? null,
      taxonomyId: insertProduct.taxonomyId ?? null,
      taxonomyPath: insertProduct.taxonomyPath ?? null,
      confidenceScore: insertProduct.confidenceScore ?? null,
      errorMessage: insertProduct.errorMessage ?? null,
      status: insertProduct.status ?? "pending",
    };
    this.products.set(id, product);
    return product;
  }

  async createProducts(insertProducts: InsertProduct[]): Promise<Product[]> {
    return Promise.all(insertProducts.map((p) => this.createProduct(p)));
  }

  async getProductsBySession(sessionId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.sessionId === sessionId);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      this.products.set(id, { ...product, ...updates });
    }
  }

  async saveTaxonomy(sessionId: string, taxonomy: any[]): Promise<void> {
    this.taxonomies.set(sessionId, taxonomy);
  }

  async getTaxonomy(sessionId: string): Promise<any[] | undefined> {
    return this.taxonomies.get(sessionId);
  }
}

export const storage = new MemStorage();
