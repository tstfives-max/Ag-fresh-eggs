import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSoldOut, isLowStock, effectivePrice } from "@/lib/services/products";
import { ProductDetail } from "./ProductDetail";

export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();

  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      soldOut={isSoldOut(product)}
      lowStock={isLowStock(product)}
      price={effectivePrice(product, false)}
    />
  );
}
