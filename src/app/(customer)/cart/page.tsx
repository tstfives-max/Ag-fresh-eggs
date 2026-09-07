"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { cartSubtotal, useCartStore } from "@/stores/cart-store";
import { useLocationStore } from "@/stores/location-store";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const withinZone = useLocationStore((s) => s.withinZone);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
          <ShoppingBag size={26} className="text-foreground-muted" />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-foreground">
          Your cart is empty
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          Add a fresh pack of eggs to get started.
        </p>
        <LinkButton href="/shop" className="mt-6">
          Shop Fresh Eggs
        </LinkButton>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Your Cart</h1>

      <div className="mt-5 flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface text-2xl">
              🥚
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.packLabel}</p>
              <p className="text-sm text-foreground-muted">
                ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-surface px-1">
              <button
                aria-label="Decrease quantity"
                onClick={() => decrement(item.productId)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => increment(item.productId)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              aria-label={`Remove ${item.packLabel}`}
              onClick={() => removeItem(item.productId)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:text-danger"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-ag-green">
        + Add more
      </Link>

      <div className="mt-6 rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center justify-between text-sm text-foreground-muted">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="mt-1 flex items-center justify-between font-semibold text-foreground">
          <span>Total</span>
          <span>₹{subtotal}</span>
        </div>

        <p className="mt-3 text-xs text-foreground-muted">
          Delivery available within 3 KM of Danapur Canteen, Patna.
        </p>

        {withinZone === false && (
          <p className="mt-2 rounded-lg bg-danger/5 px-3 py-2 text-xs text-danger">
            You&apos;re currently outside our delivery zone. Checkout is disabled until you
            confirm an address within 3 KM.
          </p>
        )}

        <Button
          size="lg"
          className="mt-4 w-full"
          disabled={withinZone === false}
          onClick={() => router.push(withinZone === null ? "/location" : "/checkout")}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
