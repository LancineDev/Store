import "server-only";
import fs from "fs";
import path from "path";
import type { Product } from "./products";
import { seedProducts } from "./products-seed";

const dataFile = path.join(process.cwd(), "data", "products.json");

export function getProducts(): Product[] {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      fs.writeFileSync(dataFile, JSON.stringify(seedProducts, null, 2), "utf-8");
      return [...seedProducts];
    }
    const raw = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(raw) as Product[];
  } catch {
    return [...seedProducts];
  }
}

export function saveProducts(products: Product[]): void {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(products, null, 2), "utf-8");
}

export function nextProductId(products: Product[]): number {
  return Math.max(0, ...products.map((p) => p.id)) + 1;
}
