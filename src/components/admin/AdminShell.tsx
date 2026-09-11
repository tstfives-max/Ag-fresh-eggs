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
import { enableAdminPush } from "@/lib/admin-push";

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
  const [enabling, setEnabling] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
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

  const PUSH_ERROR_MESSAGES: Record<string, string> = {
    unsupported: "Push notifications aren't supported in this browser — try Chrome or Edge.",
    "permission-denied":
      "Notifications are blocked for this site. Enable them in your browser's site settings, then try again.",
    "no-token": "Couldn't get a push token from Firebase. Please try again in a moment.",
    "save-failed": "Permission was granted, but we couldn't save it on our server. Please try again.",
    error: "Something went wrong enabling alerts. Please try again.",
  };

  async function handleEnableAlerts() {
    // enableAdminPush() previously had its {ok, reason} result silently discarded —
    // a failure (blocked permission, an unsupported browser, the FCM token fetch
    // throwing, or the save to our server failing) left the admin with zero
    // feedback: the click just appeared to do nothing. Now every failure mode
    // shows a specific, retriable message instead.
    setPushError(null);
    setEnabling(true);
    const result = await enableAdminPush();
    setEnabling(false);

    if (!result.ok) {
      setPushError(PUSH_ERROR_MESSAGES[result.reason ?? "error"] ?? PUSH_ERROR_MESSAGES.error);
      return;
    }

    // Re-reads the now-decided browser permission so the banner hides — doesn't
    // prompt a second time, enableAdminPush() already asked.
    await requestNotificationPermission();
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
        {(notificationPermission === "default" || pushError) && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-2 border-b px-4 py-2 text-sm sm:px-6",
              pushError
                ? "border-danger/20 bg-danger/5 text-danger"
                : "border-ag-green/20 bg-ag-green/5 text-foreground",
            )}
          >
            <Bell size={15} className={cn("shrink-0", pushError ? "text-danger" : "text-ag-green")} />
            <span>
              {pushError ?? "Get notified the moment a new order comes in — even with this browser closed."}
            </span>
            <button
              onClick={handleEnableAlerts}
              disabled={enabling}
              className={cn(
                "ml-auto shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-white disabled:opacity-60",
                pushError ? "bg-danger" : "bg-ag-green",
              )}
            >
              {enabling ? "Enabling…" : pushError ? "Retry" : "Enable alerts"}
            </button>
          </div>
        )}
        {notificationPermission === "denied" && (
          <div className="flex flex-wrap items-center gap-2 border-b border-danger/20 bg-danger/5 px-4 py-2 text-sm text-danger sm:px-6">
            <Bell size={15} className="shrink-0" />
            <span>
              Notifications are blocked for this site — a browser can&apos;t re-prompt once blocked. Open this
              site&apos;s settings in your browser (usually the padlock icon next to the address bar) and allow
              notifications, then reload this page.
            </span>
          </div>
        )}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
