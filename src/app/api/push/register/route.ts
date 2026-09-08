import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const schema = z.object({
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Invalid phone number."),
  token: z.string().trim().min(10),
  platform: z.enum(["android", "ios", "web"]).default("android"),
});

/**
 * Called from the app right after a device gets its FCM registration token AND we know
 * which customer it belongs to (i.e. right after a successful checkout, when we have
 * their phone number). One row per token; re-registering the same token just refreshes
 * `updated_at` and re-points it at the current phone (covers a shared/re-sold device).
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("push_tokens").upsert(
    {
      phone: parsed.data.phone,
      fcm_token: parsed.data.token,
      platform: parsed.data.platform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "fcm_token" },
  );

  if (error) {
    console.error("push token register failed", error);
    return NextResponse.json({ error: "Could not save push token." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
