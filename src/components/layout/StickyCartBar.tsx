"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cartCount, cartSubtotal, useCartStore } from "@/stores/cart-store";

/**
 * Compact sticky "N items · ₹total · View Cart" bar shown across the customer app
 * whenever the cart has items. Sits above BottomNav on mobile.
 */
export function StickyCartBar() {
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;

  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  return (
    <div className="fixed inset-x-0 bottom-[56px] z-30 px-3 pb-2 sm:bottom-4 sm:px-0">
      <Link
        href="/cart"
        className="ag-fade-up mx-auto flex max-w-md items-center justify-between rounded-2xl bg-ag-green px-4 py-3 text-white shadow-lg shadow-ag-green/25 transition-transform active:scale-[0.98] sm:max-w-xs"
      >
        <span className="text-sm">
          <span className="font-semibold">{count} item{count !== 1 ? "s" : ""}</span>
          <span className="mx-1.5 opacity-70">·</span>
          <span className="font-semibold">₹{subtotal}</span>
        </span>
        <span className="flex items-center gap-1 text-sm font-medium">
          View Cart <ArrowRight size={16} />
        </span>
      </Link>
    </div>
  );
}
