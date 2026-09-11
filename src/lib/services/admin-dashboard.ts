import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type DashboardStats = {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  totalStock: number;
  lowStockProducts: Array<{ pack_label: string; stock_qty: number | null; low_stock_threshold: number }>;
  bestSellingPack: string | null;
  recentOrders: Array<{
    id: string;
    order_number: number;
    customer_name: string | null;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
  }>;
};

function startOfTodayISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminSupabaseClient();
  const todayStart = startOfTodayISO();

  const [{ data: todayOrders }, { data: allOrders }, { data: products }] = await Promise.all([
    supabase.from("orders").select("total, status, payment_status").gte("created_at", todayStart),
    supabase
      .from("orders")
      .select("total, status, payment_status, items")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("products").select("pack_label, stock_qty, low_stock_threshold, in_stock"),
  ]);

  const paidToday = (todayOrders ?? []).filter((o) => o.payment_status === "paid");
  const todayRevenue = paidToday.reduce((sum, o) => sum + Number(o.total), 0);

  const pendingOrders = (allOrders ?? []).filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  ).length;
  const completedOrders = (allOrders ?? []).filter((o) => o.status === "delivered").length;

  const paidOrders = (allOrders ?? []).filter((o) => o.payment_status === "paid");
  const averageOrderValue =
    paidOrders.length > 0
      ? paidOrders.reduce((sum, o) => sum + Number(o.total), 0) / paidOrders.length
      : 0;

  const totalStock = (products ?? []).reduce((sum, p) => sum + (p.stock_qty ?? 0), 0);
  const lowStockProducts = (products ?? []).filter(
    (p) => p.stock_qty !== null && p.stock_qty <= p.low_stock_threshold,
  );

  const packCounts = new Map<string, number>();
  for (const order of allOrders ?? []) {
    const items = order.items as Array<{ packLabel: string; quantity: number }> | null;
    for (const item of items ?? []) {
      packCounts.set(item.packLabel, (packCounts.get(item.packLabel) ?? 0) + item.quantity);
    }
  }
  let bestSellingPack: string | null = null;
  let bestCount = 0;
  for (const [label, count] of packCounts) {
    if (count > bestCount) {
      bestCount = count;
      bestSellingPack = label;
    }
  }

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, status, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return {
    todayRevenue,
    todayOrders: (todayOrders ?? []).length,
    pendingOrders,
    completedOrders,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    totalStock,
    lowStockProducts,
    bestSellingPack,
    recentOrders: recentOrders ?? [],
  };
}
