import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { WhatsAppConfirmButton } from "./WhatsAppConfirmButton";
import { LinkButton } from "@/components/ui/Button";
import { CheckCircle2, Zap } from "lucide-react";
import type { Json } from "@/types/database";
import { BRAND } from "@/lib/constants";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();

  if (!order) notFound();

  const items = (order.items as Json as Array<{
    packLabel: string;
    quantity: number;
    lineTotal: number;
  }>) ?? [];

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ag-green/10">
        <CheckCircle2 size={32} className="text-ag-green" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Order Confirmed 🎉</h1>
      <p className="mt-1 text-sm text-foreground-muted">Order #{order.order_number}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
        <Zap size={12} className="fill-amber-700" />
        Arriving in ~{BRAND.deliveryTimeLabel}
      </span>

      <div className="mt-6 rounded-2xl border border-border bg-white p-4 text-left">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between py-1 text-sm">
            <span>
              {item.packLabel} × {item.quantity}
            </span>
            <span className="font-medium">₹{item.lineTotal}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
        <p className="mt-2 text-xs text-foreground-muted">
          Payment:{" "}
          <span className="font-medium text-ag-green">
            {order.payment_method === "cod"
              ? "Cash on Delivery"
              : order.payment_method === "upi_qr"
                ? "UPI — pending confirmation"
                : order.payment_status}
          </span>
        </p>
        <p className="mt-1 text-xs text-foreground-muted">Delivering to: {order.address}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <WhatsAppConfirmButton
          orderNumber={order.order_number}
          items={items}
          total={order.total}
          address={order.address}
          paymentStatus={order.payment_status}
          paymentMethod={order.payment_method}
        />
        <LinkButton href={`/orders/${order.id}`} variant="outline">
          Track my order
        </LinkButton>
      </div>
    </div>
  );
}
