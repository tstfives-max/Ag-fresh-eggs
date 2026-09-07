import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCart, assertWithinDeliveryZone, createPendingOrder, OrderValidationError } from "@/lib/services/orders";
import { createRazorpayOrder } from "@/lib/services/razorpay";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

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
});

/**
 * Frontend -> here -> Razorpay order creation.
 * Re-validates the delivery zone AND re-prices every item server-side before ever
 * talking to Razorpay, so nothing outside the 3 KM zone (or with a tampered price)
 * can reach checkout.
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

  const { customerName, customerPhone, address, latitude, longitude, items } = parsed.data;

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
    });

    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: order.total,
      receipt: `ag-order-${order.order_number}`,
      notes: { orderId: order.id, customerPhone },
    });

    const supabase = createAdminSupabaseClient();
    await supabase.from("payments").insert({
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: order.total,
      status: "created",
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: razorpayOrder.id,
      amount: order.total,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      const status = err.code === "outside_delivery_zone" ? 403 : 422;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("payments/create failed", err);
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
