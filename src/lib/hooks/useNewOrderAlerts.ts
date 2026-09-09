"use client";

import { useEffect, useRef, useState } from "react";

export type AdminOrder = {
  id: string;
  order_number: number;
  customer_name: string | null;
  customer_phone: string | null;
  address: string;
  items: Array<{ packLabel: string; quantity: number }>;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export type OrderAlert = AdminOrder & { alertId: string };

const POLL_MS = 15_000;
const SEEN_KEY = "ag-admin-last-seen-order-number";

/** Two short beeps via Web Audio — no audio asset needed, works from any admin page. */
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      const start = ctx.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  } catch {
    // Web Audio unavailable (e.g. autoplay-blocked before any user interaction) — silent, non-critical.
  }
}

/**
 * OS-level notification for a new order — pops up like any desktop/phone
 * notification (works even if the CMS tab is unfocused or in the background,
 * as long as the browser is running). Falls back silently if permission
 * hasn't been granted; callers should offer requestNotificationPermission()
 * somewhere visible (a banner, a settings toggle) so this isn't a dead end.
 */
function notifyDesktop(order: AdminOrder) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const itemsLine = order.items.map((i) => `${i.packLabel} x${i.quantity}`).join(", ");
    const n = new Notification(`New order #${order.order_number} — ₹${order.total}`, {
      body: `${order.customer_name ?? "Guest"} · ${itemsLine}`,
      icon: "/icon.png",
      tag: `ag-order-${order.id}`, // de-dupes if the same order somehow fires twice
    });
    n.onclick = () => {
      window.focus();
      window.location.href = "/admin/orders";
    };
  } catch {
    // Notification constructor can throw in odd environments (e.g. some in-app
    // browsers) — never let this break the rest of the alert pipeline.
  }
}

/**
 * Polls the existing /api/admin/orders endpoint (already session-gated,
 * service-role on the server) every 15s and turns any order newer than the
 * highest order_number this browser has seen into a toast + a nav badge
 * count + an OS-level desktop notification. Deliberately polling rather than
 * Supabase Realtime: Realtime would need the admin's browser session to have
 * direct SELECT access on `orders` via RLS, and today that table is only
 * ever read through the service-role client — adding a client-readable
 * policy just for this isn't worth the exposure. Good enough near-real-time
 * for this order volume.
 */
export function useNewOrderAlerts() {
  const [toasts, setToasts] = useState<OrderAlert[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(
    "default",
  );
  const lastSeenRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    setNotificationPermission(Notification.permission);
  }, []);

  async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotificationPermission(result);
  }

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SEEN_KEY);
      if (stored) lastSeenRef.current = Number(stored);
    } catch {
      // ignore
    }

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) return;
        const data: { orders: AdminOrder[] } = await res.json();
        const orders = data.orders ?? [];
        if (cancelled || orders.length === 0) return;

        const highest = Math.max(...orders.map((o) => o.order_number));

        if (!initializedRef.current) {
          // First load: just record the baseline, don't notify for pre-existing orders.
          initializedRef.current = true;
          if (lastSeenRef.current === null) {
            lastSeenRef.current = highest;
            try {
              sessionStorage.setItem(SEEN_KEY, String(highest));
            } catch {
              // ignore
            }
          }
          return;
        }

        if (lastSeenRef.current === null || highest <= lastSeenRef.current) return;

        const fresh = orders
          .filter((o) => o.order_number > lastSeenRef.current!)
          .sort((a, b) => a.order_number - b.order_number);

        lastSeenRef.current = highest;
        try {
          sessionStorage.setItem(SEEN_KEY, String(highest));
        } catch {
          // ignore
        }

        if (fresh.length === 0) return;

        const newToasts = fresh.map((o) => ({ ...o, alertId: `${o.id}-${Date.now()}` }));
        setToasts((prev) => [...prev, ...newToasts]);
        setUnseenCount((c) => c + fresh.length);
        playChime();
        for (const o of fresh) notifyDesktop(o);

        // Auto-dismiss each toast on its own timer so a burst of orders doesn't
        // pile up on screen forever — the nav badge count still reflects them.
        for (const t of newToasts) {
          setTimeout(() => {
            if (!cancelled) setToasts((prev) => prev.filter((x) => x.alertId !== t.alertId));
          }, 20_000);
        }
      } catch {
        // Network hiccup — next poll will catch up, no need to surface an error for this.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function dismissToast(alertId: string) {
    setToasts((prev) => prev.filter((t) => t.alertId !== alertId));
  }

  function clearUnseen() {
    setUnseenCount(0);
  }

  return {
    toasts,
    unseenCount,
    dismissToast,
    clearUnseen,
    notificationPermission,
    requestNotificationPermission,
  };
}
