import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const patchSchema = z.object({
  price: z.number().positive().optional(),
  business_price: z.number().positive().nullable().optional(),
  stock_qty: z.number().int().min(0).nullable().optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  in_stock: z.boolean().optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [{ data: product }, { data: history }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase
      .from("price_history")
      .select("*")
      .eq("product_id", id)
      .order("changed_at", { ascending: false })
      .limit(20),
  ]);

  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product, history: history ?? [] });
}

/**
 * Single endpoint for both Price Management and Inventory Management screens —
 * a price change always writes a `price_history` row (product, old price, new price,
 * changed by, when); stock/availability changes update the product directly. The
 * customer app reads straight from `products`, so a save here takes effect immediately,
 * no redeploy needed.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const supabase = createAdminSupabaseClient();
  const { data: existing, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const updates = { ...parsed.data, updated_at: new Date().toISOString() };
  const { error: updateError } = await supabase.from("products").update(updates).eq("id", id);

  if (updateError) return NextResponse.json({ error: "Failed to update product." }, { status: 500 });

  if (parsed.data.price !== undefined && parsed.data.price !== existing.price) {
    await supabase.from("price_history").insert({
      product_id: id,
      pack_label: existing.pack_label,
      old_price: existing.price,
      new_price: parsed.data.price,
    });
  }

  return NextResponse.json({ success: true });
}
