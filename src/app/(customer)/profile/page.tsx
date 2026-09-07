"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Receipt, Gift, MessageCircle, FileText, Shield, LogOut } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/constants";

const links = [
  { href: "/orders", label: "My Orders", icon: Receipt },
  { href: "/rewards", label: "AG Rewards", icon: Gift },
  { href: "/bulk", label: "Bulk & Business Orders", icon: FileText },
];

export default function ProfilePage() {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    try {
      setPhone(localStorage.getItem("ag-fresh-eggs-phone"));
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ag-green/10">
          <User size={24} className="text-ag-green" />
        </div>
        <div>
          <p className="font-display font-semibold text-foreground">
            {phone ? `+91 ${phone}` : "Guest"}
          </p>
          <p className="text-xs text-foreground-muted">AG Fresh Eggs customer</p>
        </div>
      </div>

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
        <button
          onClick={() =>
            window.open(buildWhatsAppLink("Hi AG Enterprises, I need some help."), "_blank")
          }
          className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-left text-sm font-medium text-foreground"
        >
          <MessageCircle size={18} className="text-foreground-muted" />
          Support
        </button>
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
        {phone && (
          <button
            onClick={() => {
              try {
                localStorage.removeItem("ag-fresh-eggs-phone");
              } catch {}
              setPhone(null);
            }}
            className="flex items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-danger"
          >
            <LogOut size={18} />
            Log out
          </button>
        )}
      </div>
    </div>
  );
}
