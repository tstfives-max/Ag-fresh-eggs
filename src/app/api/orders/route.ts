import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Order history for a phone number. There is no full session-based auth wired yet
 * (Supabase phone-OTP requires an SMS provider configured in the dashboard — see
 * src/lib/services/auth.ts), so "My Orders" identifies the customer by the phone
 * number they checked out with, stored client-side after a successful order.
 * This is a deliberate, documented interim: swap the phone query param for the
 * authenticated session's phone once OTP is enabled.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Missing or invalid phone." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, items, subtotal, discount, total, payment_status, status, created_at")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
