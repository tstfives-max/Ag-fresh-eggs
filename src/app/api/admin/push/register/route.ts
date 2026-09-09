import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const schema = z.object({ token: z.string().min(10) });

/**
 * Saves a Web Push (FCM) registration token against the signed-in admin, so
 * the customer-facing app's order-confirmation flow can push a "new order"
 * notification to it — even with this dashboard's browser fully closed.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("admin_push_tokens").upsert(
    {
      admin_id: session.userId,
      fcm_token: parsed.data.token,
      platform: "web",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "fcm_token" },
  );

  if (error) {
    console.error("admin push register failed", error);
    return NextResponse.json({ error: "Could not save push token." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
