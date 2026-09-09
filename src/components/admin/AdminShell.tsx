"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Warehouse,
  Users,
  Sparkles,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useNewOrderAlerts } from "@/lib/hooks/useNewOrderAlerts";
import { OrderToasts } from "@/components/admin/OrderToasts";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/products", label: "Products & Prices", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/**
 * Owns the responsive admin chrome: a fixed sidebar on desktop, and a hamburger-triggered
 * slide-out drawer on mobile (the sidebar was previously just `hidden` below `sm`, leaving
 * phone users with zero navigation into any admin section other than the one they landed on).
 */
export function AdminShell({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    toasts,
    unseenCount,
    dismissToast,
    clearUnseen,
    notificationPermission,
    requestNotificationPermission,
  } = useNewOrderAlerts();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  // Already looking at Orders (e.g. a new one arrives while this page is open,
  // or they navigated here some other way) — no reason to keep the badge lit.
  useEffect(() => {
    if (pathname.startsWith("/admin/orders")) clearUnseen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, unseenCount]);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-0.5 p-3">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => {
            if (href === "/admin/orders") clearUnseen();
            onNavigate?.();
          }}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
            isActive(href)
              ? "bg-ag-green/10 text-ag-green"
              : "text-foreground-muted hover:bg-surface hover:text-foreground",
          )}
        >
          <Icon size={17} />
          {label}
          {href === "/admin/orders" && unseenCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white">
              {unseenCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <OrderToasts toasts={toasts} onDismiss={dismissToast} />

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-white sm:flex">
        <div className="border-b border-border px-4 py-4">
          <Logo markSize={26} />
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
            Admin
          </p>
        </div>
        <NavLinks />
        <div className="border-t border-border p-3 text-xs text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} /> AG Assistant chat logs live in Settings
          </span>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <Logo markSize={24} />
              <button
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:bg-surface"
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
            <div className="border-t border-border p-3">
              <p className="truncate px-1 text-xs text-foreground-muted">{email ?? "admin"}</p>
              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/5"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface sm:hidden"
            >
              <Menu size={20} />
            </button>
            <p className="truncate text-sm text-foreground-muted">
              <span className="hidden sm:inline">Signed in as </span>
              {email ?? "admin"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground-muted hover:bg-surface sm:flex"
          >
            <LogOut size={15} /> Log out
          </button>
        </header>
        {notificationPermission === "default" && (
          <div className="flex flex-wrap items-center gap-2 border-b border-ag-green/20 bg-ag-green/5 px-4 py-2 text-sm text-foreground sm:px-6">
            <Bell size={15} className="shrink-0 text-ag-green" />
            <span>Get a desktop alert the moment a new order comes in — even in another tab.</span>
            <button
              onClick={requestNotificationPermission}
              className="ml-auto shrink-0 rounded-lg bg-ag-green px-3 py-1 text-xs font-medium text-white"
            >
              Enable alerts
            </button>
          </div>
        )}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
