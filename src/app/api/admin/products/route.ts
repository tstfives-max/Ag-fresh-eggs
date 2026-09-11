import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").order("sort_order");

  if (error) return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  return NextResponse.json({ products: data });
}
