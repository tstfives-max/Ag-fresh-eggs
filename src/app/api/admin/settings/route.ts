import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from("settings").select("*");
  if (error) return NextResponse.json({ error: "Failed to load settings." }, { status: 500 });

  return NextResponse.json({ settings: data });
}

const putSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

/**
 * Settings is a plain key/value store — this endpoint upserts one row at a time so the
 * UI can save each field independently. Every value here is admin-configurable and read
 * dynamically elsewhere (getAppSettings, getDashboardStats, loyalty route, etc); nothing
 * that lives in this table should ever be hardcoded in the app.
 */
export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: parsed.data.key, value: parsed.data.value }, { onConflict: "key" });

  if (error) return NextResponse.json({ error: "Failed to save setting." }, { status: 500 });
  return NextResponse.json({ success: true });
}
