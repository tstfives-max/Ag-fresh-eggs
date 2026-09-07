"use client";

import { useEffect, useState } from "react";
import { cartCount, useCartStore } from "@/stores/cart-store";

/**
 * Small red count badge shown on the cart icon. Isolated as its own client component
 * (rather than making the whole Header client) so the header stays a fast server component.
 */
export function CartBadge() {
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: the persisted cart only exists client-side.
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(items) : 0;
  if (count === 0) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ag-blue px-1 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
