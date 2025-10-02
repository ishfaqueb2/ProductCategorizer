import { pgTable, text, varchar, jsonb, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const processSessions = pgTable("process_sessions", {
  id: varchar("id").primaryKey(),
  productFileName: text("product_file_name").notNull(),
  taxonomyFileName: text("taxonomy_file_name").notNull(),
  confidenceThreshold: real("confidence_threshold").notNull().default(0.7),
  columnMappings: jsonb("column_mappings").notNull().$type<Record<string, string>>(),
  totalProducts: integer("total_products").notNull(),
  processedProducts: integer("processed_products").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull().references(() => processSessions.id),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  description: text("description"),
  images: text("images").array(),
  taxonomyId: text("taxonomy_id"),
  taxonomyPath: text("taxonomy_path"),
  confidenceScore: real("confidence_score"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
});

export const insertProcessSessionSchema = createInsertSchema(processSessions).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProcessSession = z.infer<typeof insertProcessSessionSchema>;
export type ProcessSession = typeof processSessions.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
