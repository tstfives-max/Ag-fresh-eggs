/**
 * Brand + business constants that are genuinely static (names, copy, external links).
 * Anything that can change without a redeploy (prices, stock, delivery radius, FAQs)
 * must NOT live here — it comes from Supabase (`products`, `settings`, `faqs`) or env vars.
 */

export const BRAND = {
  appName: "AG Fresh Eggs",
  parentCompany: "AG Enterprises",
  tagline: "Farm Fresh Eggs, Delivered Near You",
  serviceLocationLabel: "Danapur, Patna – 801503",
  // A marketing estimate, not a guarantee tied to real dispatch logic — same spirit as
  // `tagline` above. If this ever needs to vary by load/time of day, move it to the
  // `settings` table like the delivery radius already is.
  deliveryTimeLabel: "30 mins",
  contactEmail: "agenterprises626@gmail.com",
  // Calling only — deliberately separate from WHATSAPP_NUMBER below, which is a
  // different number used only for the WhatsApp chat/confirmation flows.
  callPhoneNumber: "917781898766",
  callPhoneDisplay: "+91 77818 98766",
} as const;

export const UPI = {
  id: "7781898736@indianbk",
  payeeName: "A G ENTERPRISES",
  qrImage: "/brand/upi-qr.jpg",
} as const;

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919835898736";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | "cancelled";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
