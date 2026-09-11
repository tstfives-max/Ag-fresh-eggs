"use client";

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Same public web-app config as public/firebase-messaging-sw.js — Firebase's web
// API key is restricted by domain/security rules, not a secret.
const firebaseConfig = {
  apiKey: "AIzaSyBSaRFoWh8e1ZpZ1HY7Ol35llRDOYw6C2Y",
  authDomain: "ag-egg-app.firebaseapp.com",
  projectId: "ag-egg-app",
  storageBucket: "ag-egg-app.firebasestorage.app",
  messagingSenderId: "142600766119",
  appId: "1:142600766119:web:a008ad4505e95ceeeb9182",
};

const VAPID_KEY =
  "BOdUCACCPAlPtFQawQzbdUKKbg7Lf5LTzDSRgOn26jMzppYQV9zv3zC-1k-LakhB0ghnm59DZgRp2gKYc7EOggg";

/**
 * Requests notification permission, registers the FCM service worker, grabs a
 * Web Push token, and saves it against the signed-in admin — after this
 * succeeds once, new-order pushes reach this browser even if it's fully
 * closed (as long as the OS/browser keeps the push subscription alive, which
 * is the normal case for any installed browser). Returns true on success.
 */
export async function enableAdminPush(): Promise<{ ok: boolean; reason?: string }> {
  if (typeof window === "undefined") return { ok: false, reason: "no-window" };

  const supported = await isSupported().catch(() => false);
  if (!supported) return { ok: false, reason: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "permission-denied" };

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return { ok: false, reason: "no-token" };

    const res = await fetch("/api/admin/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return { ok: false, reason: "save-failed" };

    return { ok: true };
  } catch (err) {
    console.error("enableAdminPush failed", err);
    return { ok: false, reason: "error" };
  }
}
