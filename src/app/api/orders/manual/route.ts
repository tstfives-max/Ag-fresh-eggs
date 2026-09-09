import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCart, assertWithinDeliveryZone, createPendingOrder, OrderValidationError } from "@/lib/services/orders";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendOrderConfirmedPush, sendAdminNewOrderPush } from "@/lib/services/push";

const schema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name."),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."),
  address: z.string().trim().min(8, "Please enter a complete delivery address."),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  items: z
    .array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive() }))
    .min(1),
  // "cod": cash collected at the door. "upi_qr": customer scans the static UPI QR
  // shown at checkout and pays directly — no Razorpay order, no automated
  // verification of either, so both leave payment_status "pending" for an admin to
  // mark paid once they've actually received the cash / seen the UPI credit.
  method: z.enum(["cod", "upi_qr"]),
});

/**
 * Any checkout path that doesn't go through Razorpay. Re-validates the delivery zone
 * and re-prices the cart server-side exactly like /api/payments/create, then confirms
 * the order immediately — there's no online payment step to wait on for either method.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { customerName, customerPhone, address, latitude, longitude, items, method } = parsed.data;

  try {
    const zone = assertWithinDeliveryZone(latitude, longitude);
    const isBusiness = await getIsBusinessCustomer(customerPhone);
    const priced = await priceCart(items, isBusiness);

    const order = await createPendingOrder({
      customerName,
      customerPhone,
      address,
      distanceKm: zone.distanceKm,
      priced,
      paymentMethod: method,
    });

    const supabase = createAdminSupabaseClient();
    await supabase.from("orders").update({ status: "confirmed" }).eq("id", order.id);
    await supabase.from("order_status_history").insert({ order_id: order.id, status: "confirmed" });

    // Awaited, not fire-and-forget — same reasoning as the Razorpay verify route:
    // Vercel can freeze the function right after the response is sent.
    await sendOrderConfirmedPush(order.id);
    await sendAdminNewOrderPush(order.id);

    return NextResponse.json({ orderId: order.id, orderNumber: order.order_number, total: order.total });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      const status = err.code === "outside_delivery_zone" ? 403 : 422;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("orders/manual failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

async function getIsBusinessCustomer(phone: string): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("customers")
    .select("is_business")
    .eq("phone", phone)
    .maybeSingle();
  return data?.is_business ?? false;
}
