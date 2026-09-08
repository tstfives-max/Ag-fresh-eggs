import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyRazorpayPaymentSignature } from "@/lib/services/razorpay";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendOrderConfirmedPush } from "@/lib/services/push";

const schema = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  // Optional: the paying device's FCM token, so we can register it against this order's
  // phone and push the confirmation immediately, in the same request.
  fcmToken: z.string().min(10).optional(),
});

/**
 * Called from the client immediately after Razorpay's checkout handler fires with a
 * successful payment. This is a genuine cryptographic verification (HMAC-SHA256 over
 * order_id|payment_id using the Razorpay secret) — NOT a "trust the frontend" shortcut.
 * The webhook route below performs the same update idempotently as a reliability backstop
 * in case the browser never returns here (closed tab, network drop, etc).
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification payload." }, { status: 400 });
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, fcmToken } = parsed.data;

  let signatureValid = false;
  try {
    signatureValid = verifyRazorpayPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });
  } catch (err) {
    console.error("Signature verification error", err);
  }

  const supabase = createAdminSupabaseClient();

  if (!signatureValid) {
    await supabase
      .from("payments")
      .update({ status: "failed", razorpay_payment_id, updated_at: new Date().toISOString() })
      .eq("razorpay_order_id", razorpay_order_id);

    return NextResponse.json(
      { error: "Payment wasn't completed. Your cart is safe.", success: false },
      { status: 402 },
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_phone, payment_status")
    .eq("id", orderId)
    .single();
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // The webhook (server-to-server) can beat this client-redirect call here. Remember
  // whether *this* call is the one actually transitioning the order, so only one of the
  // two paths ever sends the confirmation push.
  const alreadyConfirmed = order.payment_status === "paid";

  await supabase
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id,
      razorpay_signature,
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_order_id", razorpay_order_id);

  await supabase
    .from("orders")
    .update({ payment_status: "paid", razorpay_payment_id, status: "confirmed" })
    .eq("id", orderId);

  if (!alreadyConfirmed) {
    await supabase.from("order_status_history").insert({ order_id: orderId, status: "confirmed" });
  }

  if (fcmToken && order.customer_phone) {
    await supabase.from("push_tokens").upsert(
      { phone: order.customer_phone, fcm_token: fcmToken, platform: "android", updated_at: new Date().toISOString() },
      { onConflict: "fcm_token" },
    );
  }

  if (!alreadyConfirmed) {
    // Awaited (not fire-and-forget): Vercel can freeze a serverless function right after
    // it returns a response, so a detached background push might never actually send.
    // sendOrderConfirmedPush never throws — a push failure can't fail this request.
    await sendOrderConfirmedPush(orderId);
  }

  return NextResponse.json({ success: true, orderId });
}
