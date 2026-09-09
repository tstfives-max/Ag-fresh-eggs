"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart-store";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { PhoneSignInForm } from "@/components/auth/PhoneSignInForm";

type OrderRow = {
  id: string;
  order_number: number;
  items: Array<{ productId: string; packLabel: string; pieces: number; quantity: number; unitPrice: number }>;
  total: number;
  payment_status: string;
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clear);

  const [phone, setPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ag-fresh-eggs-phone");
      if (stored) setPhone(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!phone) return;
    setLoading(true);
    fetch(`/api/orders?phone=${phone}`)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, [phone]);

  function handleOrderAgain(order: OrderRow) {
    clearCart();
    for (const item of order.items) {
      addItem(
        { productId: item.productId, packLabel: item.packLabel, pieces: item.pieces, price: item.unitPrice },
        item.quantity,
      );
    }
    router.push("/cart");
  }

  if (!phone) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <Receipt size={28} className="mx-auto text-foreground-muted" />
        <h1 className="mt-3 font-display text-xl font-semibold text-foreground">My Orders</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Verify your mobile number with an OTP to securely see your order history
          on any device.
        </p>
        <div className="mt-4 text-left">
          <PhoneSignInForm onSignedIn={(p) => setPhone(p)} />
        </div>

        <div className="my-4 flex items-center gap-2 text-xs text-foreground-muted">
          <div className="h-px flex-1 bg-border" />
          or just look up by number
          <div className="h-px flex-1 bg-border" />
        </div>

        <input
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile number"
          inputMode="numeric"
          className="ag-input"
        />
        <Button
          variant="outline"
          className="mt-3 w-full"
          disabled={!/^[6-9]\d{9}$/.test(phoneInput)}
          onClick={() => {
            try {
              localStorage.setItem("ag-fresh-eggs-phone", phoneInput);
            } catch {}
            setPhone(phoneInput);
          }}
        >
          View my orders
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Orders</h1>

      {loading && <p className="mt-6 text-sm text-foreground-muted">Loading…</p>}

      {!loading && orders && orders.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-sm text-foreground-muted">No orders yet.</p>
          <LinkButton href="/shop" className="mt-4">
            Shop Fresh Eggs
          </LinkButton>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">Order #{order.order_number}</p>
                <p className="text-xs text-foreground-muted">
                  {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>

            <p className="mt-2 text-sm text-foreground-muted">
              {order.items.map((i) => `${i.packLabel} x${i.quantity}`).join(", ")}
            </p>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold text-foreground">₹{order.total}</span>
              <span className="text-xs capitalize text-foreground-muted">{order.payment_status}</span>
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href={`/orders/${order.id}`}
                className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium"
              >
                View Details
              </Link>
              <button
                onClick={() => handleOrderAgain(order)}
                className="flex-1 rounded-lg bg-ag-green py-2 text-center text-sm font-medium text-white"
              >
                Order Again
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
