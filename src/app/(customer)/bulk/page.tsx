"use client";

import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/constants";

const audiences = ["Hostels", "PGs", "Restaurants", "Tiffin services", "Shops", "Hotels"];

export default function BulkOrdersPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ag-blue/10">
        <Building2 size={26} className="text-ag-blue" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
        Bulk &amp; Business Orders
      </h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Ordering regularly for your hostel, PG, restaurant, tiffin service, shop, or hotel?
        We&apos;ll set you up with bulk pricing and a dedicated delivery slot.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {audiences.map((a) => (
          <span key={a} className="rounded-full bg-surface px-3 py-1 text-xs text-foreground-muted">
            {a}
          </span>
        ))}
      </div>

      <Button
        size="lg"
        className="mt-6 w-full"
        onClick={() =>
          window.open(
            buildWhatsAppLink(
              "Namaste AG Enterprises, mujhe regular egg orders ke liye bulk/business pricing chahiye.",
            ),
            "_blank",
          )
        }
      >
        Request Bulk Pricing
      </Button>
    </div>
  );
}
