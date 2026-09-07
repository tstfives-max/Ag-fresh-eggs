import { NextResponse } from "next/server";
import { z } from "zod";
import { validateDeliveryZone } from "@/lib/services/geo";

const bodySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Server-side delivery-zone check. The client may also run a quick local estimate
 * for instant UI feedback, but this endpoint is the one whose result checkout actually
 * trusts — see /api/payments/create, which calls validateDeliveryZone() again itself.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid coordinates." },
      { status: 400 },
    );
  }

  const result = validateDeliveryZone(parsed.data);
  return NextResponse.json(result);
}
