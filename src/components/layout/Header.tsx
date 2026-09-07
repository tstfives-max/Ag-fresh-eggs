import Link from "next/link";
import { MapPin, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CartBadge } from "@/components/layout/CartBadge";
import { BRAND } from "@/lib/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="AG Fresh Eggs home">
          <Logo />
        </Link>

        <Link
          href="/location"
          className="hidden items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground sm:flex"
        >
          <MapPin size={14} className="text-ag-green shrink-0" />
          {BRAND.serviceLocationLabel}
        </Link>

        <Link
          href="/cart"
          aria-label="View cart"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface"
        >
          <ShoppingCart size={20} />
          <CartBadge />
        </Link>
      </div>
    </header>
  );
}
