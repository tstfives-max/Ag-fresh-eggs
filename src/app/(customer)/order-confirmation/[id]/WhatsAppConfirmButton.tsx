"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/constants";

/**
 * Opens WhatsApp with a prefilled confirmation message — the customer still has to press
 * Send themselves. Never sends automatically.
 */
export function WhatsAppConfirmButton({
  orderNumber,
  items,
  total,
  address,
  paymentStatus,
  paymentMethod,
}: {
  orderNumber: number;
  items: Array<{ packLabel: string; quantity: number; lineTotal: number }>;
  total: number;
  address: string;
  paymentStatus: string;
  paymentMethod: string;
}) {
  const itemsLine = items.map((i) => `${i.packLabel} x${i.quantity}`).join(", ");
  const paymentLine =
    paymentMethod === "cod"
      ? "Cash on Delivery"
      : paymentStatus === "paid"
        ? "Confirmed via Razorpay"
        : paymentStatus;
  const message = [
    `Namaste AG Enterprises, maine order place kiya hai.`,
    `Order #${orderNumber}`,
    `Items: ${itemsLine}`,
    `Total: ₹${total}`,
    `Delivery address: ${address}`,
    `Payment: ${paymentLine}`,
    `Please mera delivery slot confirm kar dijiye.`,
  ].join("\n");

  return (
    <Button
      variant="secondary"
      size="lg"
      onClick={() => window.open(buildWhatsAppLink(message), "_blank")}
    >
      <MessageCircle size={18} />
      Confirm on WhatsApp
    </Button>
  );
}
