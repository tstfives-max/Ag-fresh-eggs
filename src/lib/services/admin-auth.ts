import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Tables } from "@/types/database";

export type AdminSession = {
  userId: string;
  email: string | null;
  admin: Tables<"admins">;
};

/**
 * Resolves the currently signed-in Supabase Auth user (from the request's session
 * cookie) and checks they have a row in `admins`. Returns null if not signed in or
 * not an admin — callers decide whether that means redirect (pages) or 401 (API routes).
 *
 * Uses the admin (service-role) client only to read `admins` — the customer-facing
 * "admins read own row" RLS policy would also allow this via the session client, but
 * reading through the service-role client here avoids a second round trip through RLS
 * for a check that's already gated on a verified session user id.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminClient = createAdminSupabaseClient();
  const { data: admin } = await adminClient
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) return null;

  return { userId: user.id, email: user.email ?? null, admin };
}
