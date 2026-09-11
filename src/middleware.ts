import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * HTTP Basic Auth gate in front of /admin/*, on top of the real Supabase-backed admin
 * login behind it. Exists for preview deployments where we want a coarse "don't let
 * randoms even see the login screen" layer without paying for Vercel's Advanced
 * Deployment Protection. Controlled entirely by env vars — if either is unset, this
 * middleware is a no-op (never blocks /admin when not configured, e.g. local dev).
 */
export function middleware(request: NextRequest) {
  const user = process.env.ADMIN_BASIC_AUTH_USER;
  const pass = process.env.ADMIN_BASIC_AUTH_PASSWORD;

  if (!user || !pass) return NextResponse.next();

  const authHeader = request.headers.get("authorization");
  const expected = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");

  if (authHeader === expected) return NextResponse.next();

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="AG Fresh Eggs Admin"' },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
