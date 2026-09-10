"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Receipt, MessageCircle, FileText, Shield, LogOut } from "lucide-react";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const links = [
  { href: "/orders", label: "My Orders", icon: Receipt },
  { href: "/bulk", label: "Bulk & Business Orders", icon: FileText },
  { href: "/contact", label: "Contact Us", icon: MessageCircle },
];

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuthUser();
  const [phone, setPhone] = useState<string | null>(null);
  const linkedRef = useRef(false);

  useEffect(() => {
    try {
      setPhone(localStorage.getItem("ag-fresh-eggs-phone"));
    } catch {
      // ignore
    }
  }, []);

  // Once signed in: either link this device's known phone to the account (first
  // time on a device that's already placed orders), or, on a fresh device, pull
  // back whichever phone is already linked so order history follows the account.
  useEffect(() => {
    if (!user || linkedRef.current) return;
    linkedRef.current = true;

    if (phone) {
      fetch("/api/account/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      }).catch(() => {});
    } else {
      fetch("/api/account/phone")
        .then((r) => r.json())
        .then((data) => {
          if (data.phone) {
            setPhone(data.phone);
            try {
              localStorage.setItem("ag-fresh-eggs-phone", data.phone);
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [user, phone]);

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ag-green/10">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl} alt="" width={56} height={56} className="h-full w-full object-cover" />
          ) : (
            <User size={24} className="text-ag-green" />
          )}
        </div>
        <div>
          <p className="font-display font-semibold text-foreground">
            {user?.name ?? (phone ? `+91 ${phone}` : "Guest")}
          </p>
          <p className="text-xs text-foreground-muted">
            {user?.email ?? "AG Fresh Eggs customer"}
          </p>
        </div>
      </div>

      {!user && !authLoading && (
        <div className="mt-4 rounded-2xl border border-border bg-white p-4">
          <p className="text-sm text-foreground-muted">
            Sign in to save your details and find your orders on any device.
          </p>
          <GoogleSignInButton next="/profile" className="mt-3 w-full" />
        </div>
      )}

      <div className="mt-6 flex flex-col overflow-hidden rounded-2xl border border-border bg-white">
        {links.map(({ href, label, icon: Icon }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground ${
              i !== links.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <Icon size={18} className="text-foreground-muted" />
            {label}
          </Link>
        ))}
        <Link
          href="/terms"
          className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium text-foreground"
        >
          <Shield size={18} className="text-foreground-muted" />
          Terms of Service
        </Link>
        <Link
          href="/privacy"
          className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium text-foreground"
        >
          <Shield size={18} className="text-foreground-muted" />
          Privacy Policy
        </Link>
        {(phone || user) && (
          <button
            onClick={async () => {
              if (user) await signOut();
              try {
                localStorage.removeItem("ag-fresh-eggs-phone");
              } catch {}
              setPhone(null);
            }}
            className="flex items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-danger"
          >
            <LogOut size={18} />
            {user ? "Sign out" : "Log out"}
          </button>
        )}
      </div>
    </div>
  );
}
