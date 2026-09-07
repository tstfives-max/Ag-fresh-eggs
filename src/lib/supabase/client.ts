"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Browser-side Supabase client. Uses the anon key only — RLS policies govern
 * exactly what a signed-in customer can read/write (see the addresses/customers/
 * orders/subscriptions policies applied in the ag_fresh_eggs_extend_schema migration).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
