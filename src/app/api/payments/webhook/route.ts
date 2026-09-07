import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/services/razorpay";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Razorpay webhook (configure this URL + RAZORPAY_WEBHOOK_SECRET in the Razorpay dashboard:
 * Settings -> Webhooks). This is the authoritative, server-to-server confirmation of payment
 * status — it must keep working even if the customer's browser never gets back to /verify.
 * Idempotent: safe to receive the same event more than once.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let valid = false;
  try {
    valid = verifyRazorpayWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("Webhook signature check failed to run", err);
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createAdminSupabaseClient();

  const paymentEntity = event?.payload?.payment?.entity;
  const razorpayOrderId: string | undefined = paymentEntity?.order_id;
  const razorpayPaymentId: string | undefined = paymentEntity?.id;

  if (!razorpayOrderId) {
    return NextResponse.json({ received: true }); // not a payment event we track
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("order_id, status")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ received: true });
  }

  await supabase.from("payments").update({
    raw_webhook_payload: event,
    updated_at: new Date().toISOString(),
    ...(event.event === "payment.captured"
      ? { status: "paid", razorpay_payment_id: razorpayPaymentId }
      : event.event === "payment.failed"
        ? { status: "failed", razorpay_payment_id: razorpayPaymentId }
        : {}),
  }).eq("razorpay_order_id", razorpayOrderId);

  if (event.event === "payment.captured" && payment.status !== "paid") {
    await supabase
      .from("orders")
      .update({ payment_status: "paid", razorpay_payment_id: razorpayPaymentId, status: "confirmed" })
      .eq("id", payment.order_id);

    await supabase
      .from("order_status_history")
      .insert({ order_id: payment.order_id, status: "confirmed" });
  }

  if (event.event === "payment.failed") {
    await supabase.from("orders").update({ payment_status: "failed" }).eq("id", payment.order_id);
  }

  return NextResponse.json({ received: true });
}
