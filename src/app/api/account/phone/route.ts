import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Resolves the phone linked to the signed-in Google account (if any) — lets a
 * customer see their order history on a new device just by signing in, without
 * re-typing the phone number they originally ordered with.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ phone: null });
  }

  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("customers")
    .select("phone")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ phone: data?.phone ?? null });
}
