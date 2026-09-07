"use client";

import { createClient } from "@/lib/supabase/client";

export type LiteProduct = {
  id: string;
  pack_label: string;
  pieces: number;
  price: number;
};

export async function fetchProductsClient(): Promise<LiteProduct[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, pack_label, pieces, price")
    .order("sort_order");

  if (error) {
    console.error("Failed to load products", error);
    return [];
  }
  return data ?? [];
}
