import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Privileged Supabase client using the service role key. BYPASSES ROW LEVEL SECURITY.
 *
 * `import "server-only"` makes it a build error to import this from any client component.
 * Use ONLY for:
 *  - order creation after a validated checkout (server route)
 *  - Razorpay webhook handling
 *  - admin dashboard reads/writes (after verifying the caller is in `admins`)
 *  - the Gemini AI backend's tool calls (product lookups, cart/order actions)
 *
 * Never import this into anything that runs in the browser.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Set SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase dashboard -> Project Settings -> API).",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
