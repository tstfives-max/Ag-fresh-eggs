"use client";

/**
 * Native push notifications (FCM via Capacitor), only meaningful inside the installed
 * Android app — a complete no-op in every regular browser, so this is safe to call from
 * shared code that also runs on the plain website.
 *
 * Flow: register once on app launch (gets a device token from FCM), cache it in memory,
 * then tie it to a phone number the moment we learn one — right after checkout succeeds.
 * We deliberately don't ask for notification permission until launch-time registration;
 * Android 13+ requires the POST_NOTIFICATIONS runtime permission, which
 * PushNotifications.requestPermissions() handles.
 */

let cachedToken: string | null = null;
let initPromise: Promise<void> | null = null;

export function initPushNotifications(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;

    const { PushNotifications } = await import("@capacitor/push-notifications");

    let status = (await PushNotifications.checkPermissions()).receive;
    if (status === "prompt") {
      status = (await PushNotifications.requestPermissions()).receive;
    }
    if (status !== "granted") return;

    PushNotifications.addListener("registration", (token) => {
      cachedToken = token.value;
    });
    PushNotifications.addListener("registrationError", (err) => {
      console.error("Push registration error", err);
    });

    await PushNotifications.register();
  })().catch((err) => {
    console.error("initPushNotifications failed", err);
  });

  return initPromise;
}

/** The current device's cached FCM token, if registration has completed. Null on the web. */
export function getPushToken(): string | null {
  return cachedToken;
}

/**
 * Ties the current device's FCM token to a phone number server-side. Call this right
 * after a checkout succeeds, once we actually know the customer's phone. Best-effort —
 * never throws, never blocks the caller (checkout must succeed even if this fails).
 */
export async function registerPushTokenForPhone(phone: string): Promise<void> {
  try {
    await initPromise; // make sure registration has had a chance to produce a token
    if (!cachedToken) return;

    await fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, token: cachedToken, platform: "android" }),
    });
  } catch (err) {
    console.error("registerPushTokenForPhone failed", err);
  }
}
