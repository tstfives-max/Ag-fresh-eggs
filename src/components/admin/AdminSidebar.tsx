"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Warehouse,
  Users,
  Sparkles,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/products", label: "Products & Prices", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-white sm:flex">
      <div className="border-b border-border px-4 py-4">
        <Logo markSize={26} />
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
          Admin
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                active
                  ? "bg-ag-green/10 text-ag-green"
                  : "text-foreground-muted hover:bg-surface hover:text-foreground",
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 text-xs text-foreground-muted">
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} /> AG Assistant chat logs live in Settings
        </span>
      </div>
    </aside>
  );
}
