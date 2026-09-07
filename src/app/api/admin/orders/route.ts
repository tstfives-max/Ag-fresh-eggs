import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ORDER_STATUSES } from "@/lib/constants";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const payment = searchParams.get("payment");

  const supabase = createAdminSupabaseClient();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);

  if (status) query = query.eq("status", status);
  if (payment) query = query.eq("payment_status", payment);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });

  return NextResponse.json({ orders: data });
}

const patchSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([...ORDER_STATUSES, "cancelled"]),
});

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.orderId);

  if (error) return NextResponse.json({ error: "Failed to update order." }, { status: 500 });

  await supabase.from("order_status_history").insert({
    order_id: parsed.data.orderId,
    status: parsed.data.status,
    changed_by: session.email ?? session.userId,
  });

  return NextResponse.json({ success: true });
}
