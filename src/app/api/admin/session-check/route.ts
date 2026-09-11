import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/services/admin-auth";

/** Used by the admin login form to confirm a freshly-authenticated user is actually an admin. */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not an admin." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
