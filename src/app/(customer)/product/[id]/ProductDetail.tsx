"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/lib/services/products";

export function ProductDetail({
  product,
  soldOut,
  lowStock,
  price,
}: {
  product: Product;
  soldOut: boolean;
  lowStock: boolean;
  price: number;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  function handleAddToCart() {
    addItem(
      { productId: product.id, packLabel: product.pack_label, pieces: product.pieces, price },
      qty,
    );
    router.push("/cart");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex h-56 items-center justify-center rounded-2xl bg-surface text-8xl">
        🥚
      </div>

      <div className="mt-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{product.pack_label}</h1>
          <p className="mt-1 text-sm text-foreground-muted">{product.pieces} eggs per pack</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-ag-green/10 px-2.5 py-1 text-xs font-medium text-ag-green">
          <ShieldCheck size={13} /> Fresh
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-foreground">₹{price}</p>

      {soldOut && (
        <p className="mt-2 rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
          This pack is currently sold out.
        </p>
      )}
      {lowStock && !soldOut && (
        <p className="mt-2 rounded-lg bg-warning/5 px-3 py-2 text-sm text-warning">
          Only a few left — order soon.
        </p>
      )}

      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
        Farm-fresh eggs sourced fresh every morning and date-stamped for freshness. A{" "}
        {product.pack_label.toLowerCase()} pack, delivered within 3 KM of Danapur Canteen, Patna.
      </p>

      {!soldOut && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-11 items-center rounded-xl bg-surface px-1">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center font-semibold">{qty}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm"
            >
              <Plus size={16} />
            </button>
          </div>
          <Button size="lg" className="flex-1" onClick={handleAddToCart}>
            Add to Cart — ₹{price * qty}
          </Button>
        </div>
      )}
    </div>
  );
}
