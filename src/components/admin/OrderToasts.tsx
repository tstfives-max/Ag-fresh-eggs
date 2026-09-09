"use client";

import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderAlert } from "@/lib/hooks/useNewOrderAlerts";

/** Fixed top-right stack of "new order" toasts, each with full order details. */
export function OrderToasts({
  toasts,
  onDismiss,
}: {
  toasts: OrderAlert[];
  onDismiss: (alertId: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4">
      {toasts.map((order) => (
        <div
          key={order.alertId}
          className="pointer-events-auto w-full max-w-sm rounded-2xl border border-ag-green/20 bg-white p-4 shadow-lg ring-1 ring-black/5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ag-green/10 text-ag-green">
                <ShoppingBag size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">New order! #{order.order_number}</p>
                <p className="text-xs text-foreground-muted">
                  {new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDismiss(order.alertId)}
              aria-label="Dismiss"
              className="shrink-0 rounded-md p-1 text-foreground-muted hover:bg-surface"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-2.5 space-y-1 text-xs text-foreground-muted">
            <p>
              <span className="font-medium text-foreground">{order.customer_name ?? "Guest"}</span>
              {order.customer_phone ? ` · +91 ${order.customer_phone}` : ""}
            </p>
            <p>{order.items.map((i) => `${i.packLabel} x${i.quantity}`).join(", ")}</p>
            <p className="line-clamp-2">{order.address}</p>
            <p className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="font-semibold text-foreground">₹{order.total}</span>
              <span className="capitalize">{order.payment_status}</span>
              {order.payment_method === "cod" && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                  COD
                </span>
              )}
              <span>·</span>
              <span>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
            </p>
          </div>

          <Link
            href="/admin/orders"
            onClick={() => onDismiss(order.alertId)}
            className="mt-3 block rounded-lg bg-ag-green py-2 text-center text-xs font-medium text-white"
          >
            View in Orders
          </Link>
        </div>
      ))}
    </div>
  );
}
