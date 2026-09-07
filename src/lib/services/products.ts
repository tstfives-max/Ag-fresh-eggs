import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Product = Tables<"products">;

/**
 * Reads live product/pricing/stock data from Supabase. Never hardcode a pack's price
 * or availability anywhere in the UI — every screen that shows a price calls this
 * (or its client-side equivalent) so an admin price/stock edit is reflected immediately,
 * with no redeploy.
 */
export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  return data ?? [];
}

export function isSoldOut(product: Product): boolean {
  if (!product.in_stock) return true;
  if (product.stock_qty !== null && product.stock_qty <= 0) return true;
  return false;
}

export function isLowStock(product: Product): boolean {
  if (product.stock_qty === null) return false;
  return product.stock_qty > 0 && product.stock_qty <= product.low_stock_threshold;
}

export function effectivePrice(product: Product, isBusiness: boolean): number {
  if (isBusiness && product.business_price !== null) {
    return product.business_price;
  }
  return product.price;
}

export type ProductCategory = "popular" | "small" | "family" | "bulk";

/**
 * Derives a shop category from pack size rather than a hardcoded per-product mapping,
 * so a new pack added in the database slots into the catalog automatically.
 */
export function categoryFor(product: Product): ProductCategory {
  if (product.pieces <= 12) return "popular";
  if (product.pieces <= 30) return "small";
  if (product.pieces <= 50) return "family";
  return "bulk";
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  popular: "Popular",
  small: "Small Packs",
  family: "Family Packs",
  bulk: "Bulk Orders",
};
