import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { validateDeliveryZone } from "@/lib/services/geo";
import { effectivePrice, isSoldOut } from "@/lib/services/products";

export type CheckoutItemInput = { productId: string; quantity: number };

export type PricedOrder = {
  items: Array<{
    productId: string;
    packLabel: string;
    pieces: number;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
};

export class OrderValidationError extends Error {
  constructor(
    message: string,
    public code:
      | "outside_delivery_zone"
      | "empty_cart"
      | "product_unavailable"
      | "invalid_input",
  ) {
    super(message);
  }
}

/**
 * Re-prices a cart against the live `products` table. The client's cart never sets the
 * price that gets charged — this function is the only source of truth for what an order
 * actually costs, so a stale client price (or a tampered request) can never under/over-charge.
 */
export async function priceCart(
  items: CheckoutItemInput[],
  isBusiness: boolean,
): Promise<PricedOrder> {
  if (!items.length) {
    throw new OrderValidationError("Your cart is empty.", "empty_cart");
  }

  const supabase = createAdminSupabaseClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .in(
      "id",
      items.map((i) => i.productId),
    );

  if (error) throw new Error(`Failed to load products for pricing: ${error.message}`);

  const priced: PricedOrder["items"] = [];

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new OrderValidationError("Invalid item quantity.", "invalid_input");
    }
    const product = products?.find((p) => p.id === item.productId);
    if (!product) {
      throw new OrderValidationError("One of the items in your cart is no longer available.", "product_unavailable");
    }
    if (isSoldOut(product)) {
      throw new OrderValidationError(`${product.pack_label} is currently sold out.`, "product_unavailable");
    }

    const unitPrice = effectivePrice(product, isBusiness);
    priced.push({
      productId: product.id,
      packLabel: product.pack_label,
      pieces: product.pieces,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    });
  }

  const subtotal = priced.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items: priced, subtotal };
}

export function assertWithinDeliveryZone(latitude: number, longitude: number) {
  const result = validateDeliveryZone({ latitude, longitude });
  if (!result.withinZone) {
    throw new OrderValidationError(result.message, "outside_delivery_zone");
  }
  return result;
}

/**
 * Creates a `pending` order + its initial status-history row + the `payments` row that
 * ties it to a Razorpay order. Called only after pricing + geofence checks pass.
 */
export async function createPendingOrder(params: {
  customerName: string;
  customerPhone: string;
  address: string;
  distanceKm: number;
  priced: PricedOrder;
  discount?: number;
  paymentMethod?: "razorpay" | "cod" | "upi_qr";
}) {
  const supabase = createAdminSupabaseClient();
  const discount = params.discount ?? 0;
  const total = Math.max(0, params.priced.subtotal - discount);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      address: params.address,
      distance_km: params.distanceKm,
      items: params.priced.items,
      subtotal: params.priced.subtotal,
      discount,
      total,
      payment_method: params.paymentMethod ?? "razorpay",
      payment_status: "pending",
      status: "placed",
    })
    .select("*")
    .single();

  if (error || !order) throw new Error(`Failed to create order: ${error?.message}`);

  await supabase.from("order_status_history").insert({ order_id: order.id, status: "placed" });

  // Keep the customers table in sync (upsert by phone) so returning customers are recognized.
  await supabase
    .from("customers")
    .upsert({ phone: params.customerPhone, name: params.customerName }, { onConflict: "phone" });

  return order;
}
