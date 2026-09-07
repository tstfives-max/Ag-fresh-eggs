"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/lib/services/products";

const EGG_EMOJI = "🥚";

export function ProductCard({
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
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [justAdded, setJustAdded] = useState(false);

  const inCartQty = items.find((i) => i.productId === product.id)?.quantity ?? 0;

  function handleAdd() {
    if (soldOut) return;
    addItem({
      productId: product.id,
      packLabel: product.pack_label,
      pieces: product.pieces,
      price,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        soldOut && "opacity-60",
      )}
    >
      {lowStock && !soldOut && (
        <span className="absolute right-3 top-3 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
          Low stock
        </span>
      )}
      {soldOut && (
        <span className="absolute right-3 top-3 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-medium text-danger">
          Sold Out
        </span>
      )}

      <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-xl bg-surface text-4xl">
        {EGG_EMOJI}
      </div>

      <h3 className="font-display font-semibold text-foreground">{product.pack_label}</h3>
      <p className="mt-0.5 text-xs text-foreground-muted">{product.pieces} eggs</p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-lg font-bold text-foreground">₹{price}</span>
      </div>

      {inCartQty === 0 ? (
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className={cn(
            "mt-3 flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
            soldOut
              ? "cursor-not-allowed bg-border text-foreground-muted"
              : justAdded
                ? "bg-ag-blue text-white"
                : "bg-ag-green text-white hover:bg-ag-green-dark active:scale-[0.98]",
          )}
        >
          {justAdded ? (
            "Added to cart"
          ) : (
            <>
              <ShoppingCart size={15} /> Add
            </>
          )}
        </button>
      ) : (
        <div className="mt-3 flex h-9 items-center justify-between rounded-lg bg-surface px-1">
          <button
            aria-label="Decrease quantity"
            onClick={() => useCartStore.getState().decrement(product.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-ag-green shadow-sm"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-semibold">{inCartQty}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => useCartStore.getState().increment(product.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-ag-green shadow-sm"
          >
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
