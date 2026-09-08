import "server-only";
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Lazily initializes the Firebase Admin app from three env vars pulled straight out of
 * the Firebase service account JSON (Project settings -> Service accounts -> Generate
 * new private key): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.
 * Never throws at import time — only when a push is actually attempted — so the rest of
 * checkout keeps working even if push isn't configured yet.
 */
function getFirebaseApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel env vars can't hold real newlines, so the key is stored with literal \n
  // sequences and unescaped here.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

/**
 * Sends a push notification to every device token registered for a phone number, and
 * prunes any token FCM reports as no longer valid (app uninstalled, token rotated, etc).
 * Best-effort by design: callers should never let a push failure break checkout or order
 * status updates — wrap calls to this in try/catch and just log.
 */
export async function sendPushToPhone(
  phone: string,
  notification: { title: string; body: string },
  data?: Record<string, string>,
): Promise<{ sent: number; total: number }> {
  const supabase = createAdminSupabaseClient();
  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("fcm_token")
    .eq("phone", phone);

  if (!tokens || tokens.length === 0) {
    return { sent: 0, total: 0 };
  }

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  let sent = 0;
  const staleTokens: string[] = [];

  await Promise.all(
    tokens.map(async ({ fcm_token }) => {
      try {
        await messaging.send({ token: fcm_token, notification, data });
        sent += 1;
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-argument") {
          staleTokens.push(fcm_token);
        } else {
          console.error("FCM send failed", err);
        }
      }
    }),
  );

  if (staleTokens.length > 0) {
    await supabase.from("push_tokens").delete().in("fcm_token", staleTokens);
  }

  return { sent, total: tokens.length };
}

/**
 * Looks up the order's customer + order number and sends the "order confirmed" push.
 * Called right after payment verification succeeds (both the client-redirect /verify
 * path and the webhook backstop) — never lets a push failure surface to the caller.
 */
export async function sendOrderConfirmedPush(orderId: string): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data: order } = await supabase
      .from("orders")
      .select("customer_phone, order_number, total")
      .eq("id", orderId)
      .maybeSingle();

    if (!order || !order.customer_phone) return;

    await sendPushToPhone(
      order.customer_phone,
      {
        title: "Order confirmed! 🥚",
        body: `Order #${order.order_number} is confirmed — ₹${order.total}. We'll notify you as it moves.`,
      },
      { orderId, type: "order_confirmed" },
    );
  } catch (err) {
    console.error("sendOrderConfirmedPush failed", err);
  }
}
