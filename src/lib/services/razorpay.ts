import "server-only";
import Razorpay from "razorpay";
import crypto from "node:crypto";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured. Set them in .env.local.",
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createRazorpayOrder(params: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = getRazorpayClient();
  return client.orders.create({
    amount: Math.round(params.amountInRupees * 100), // paise
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
}

/**
 * Verifies the checkout-handler signature Razorpay returns after a successful payment.
 * This is the ONLY thing allowed to mark a payment as verified from the client-redirect
 * path — never trust a plain "success" boolean the frontend claims.
 */
export function verifyRazorpayPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not configured.");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(params.razorpaySignature, "hex"),
  );
}

/**
 * Verifies an inbound Razorpay webhook's X-Razorpay-Signature header against the raw
 * request body, using RAZORPAY_WEBHOOK_SECRET (configured separately from the API secret
 * in the Razorpay dashboard's webhook settings).
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false; // length mismatch etc. -> definitely not a match
  }
}
