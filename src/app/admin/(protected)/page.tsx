import Link from "next/link";
import { IndianRupee, ShoppingBag, Clock, CheckCircle2, Layers, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/services/admin-dashboard";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-foreground">Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={<IndianRupee size={16} />} label="Today's Revenue" value={`₹${stats.todayRevenue}`} />
        <StatCard icon={<ShoppingBag size={16} />} label="Today's Orders" value={stats.todayOrders} />
        <StatCard icon={<Clock size={16} />} label="Pending Orders" value={stats.pendingOrders} />
        <StatCard icon={<CheckCircle2 size={16} />} label="Completed" value={stats.completedOrders} />
        <StatCard icon={<IndianRupee size={16} />} label="Avg Order Value" value={`₹${stats.averageOrderValue}`} />
        <StatCard icon={<Layers size={16} />} label="Current Stock" value={stats.totalStock} />
      </div>

      {stats.bestSellingPack && (
        <p className="mt-3 text-sm text-foreground-muted">
          Best-selling pack: <span className="font-medium text-foreground">{stats.bestSellingPack}</span>
        </p>
      )}

      {stats.lowStockProducts.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Low stock</p>
            <p>
              {stats.lowStockProducts.map((p) => `${p.pack_label} (${p.stock_qty ?? 0} left)`).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-medium text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-ag-green">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-foreground-muted">
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium text-foreground">#{order.order_number}</td>
                  <td className="px-4 py-2.5">{order.customer_name ?? "—"}</td>
                  <td className="px-4 py-2.5">₹{order.total}</td>
                  <td className="px-4 py-2.5">{ORDER_STATUS_LABELS[order.status] ?? order.status}</td>
                  <td className="px-4 py-2.5 capitalize">{order.payment_status}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-foreground-muted">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <div className="flex items-center gap-1.5 text-foreground-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1.5 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
