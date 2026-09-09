"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Receipt, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/orders", label: "Orders", icon: Receipt },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-2 text-[11px]"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={22}
                className={cn(active ? "text-ag-green" : "text-foreground-muted")}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className={cn(active ? "font-medium text-ag-green" : "text-foreground-muted")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
