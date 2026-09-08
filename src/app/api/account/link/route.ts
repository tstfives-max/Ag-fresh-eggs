import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const schema = z.object({ phone: z.string().trim().regex(/^[6-9]\d{9}$/) });

/**
 * Ties the signed-in Google account to a phone number the customer has used for
 * guest checkout — this is what makes "order history follows your account" real.
 * Called client-side once we know both a session AND a phone (e.g. right after
 * Google sign-in, if a phone is already in localStorage from a past guest order).
 */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("customers")
    .upsert({ phone: parsed.data.phone, auth_user_id: user.id }, { onConflict: "phone" });

  if (error) {
    console.error("account link failed", error);
    return NextResponse.json({ error: "Could not link account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
