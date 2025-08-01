import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // cpu, vga, mainboard, etc.
  brand: text("brand").notNull(),
  price: integer("price").notNull(), // price in VND
  image: text("image").notNull(),
  description: text("description"), // short description
  specs: json("specs").$type<Record<string, any>>(),
  socket: text("socket"), // for CPU/Mainboard compatibility
  wattage: integer("wattage"), // power consumption
  inStock: boolean("in_stock").default(true),
});

export const builds = pgTable("builds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  components: json("components").$type<Record<string, string>>(), // category -> product_id mapping
  totalPrice: integer("total_price").notNull(),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertBuildSchema = createInsertSchema(builds).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertBuild = z.infer<typeof insertBuildSchema>;
export type Build = typeof builds.$inferSelect;

export type ComponentCategory = 
  | "cpu" 
  | "vga" 
  | "mainboard" 
  | "psu" 
  | "ram" 
  | "ssd" 
  | "hdd" 
  | "case" 
  | "cooler" 
  | "monitor" 
  | "fan" 
  | "mouse" 
  | "keyboard" 
  | "headset";

export const COMPONENT_CATEGORIES: { 
  id: ComponentCategory; 
  name: string; 
  order: number; 
}[] = [
  { id: "cpu", name: "Chọn CPU", order: 1 },
  { id: "vga", name: "Chọn VGA - Card màn hình", order: 2 },
  { id: "mainboard", name: "Chọn Mainboard", order: 3 },
  { id: "psu", name: "Chọn PSU - Nguồn", order: 4 },
  { id: "cooler", name: "Chọn Tản nhiệt CPU", order: 5 },
  { id: "ram", name: "Chọn Ram", order: 6 },
  { id: "case", name: "Chọn Case - Thùng máy", order: 7 },
  { id: "ssd", name: "Chọn SSD", order: 8 },
  { id: "hdd", name: "Chọn HDD", order: 9 },
  { id: "monitor", name: "Chọn LCD - Màn hình", order: 10 },
  { id: "fan", name: "Chọn Fan Case", order: 11 },
  { id: "mouse", name: "Chọn Chuột", order: 12 },
  { id: "keyboard", name: "Chọn Bàn phím", order: 13 },
  { id: "headset", name: "Chọn Tai nghe", order: 14 },
];
