"use client";

import { useEffect, useState } from "react";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/constants";

type Order = {
  id: string;
  order_number: number;
  customer_name: string | null;
  customer_phone: string | null;
  address: string;
  items: Array<{ packLabel: string; quantity: number }>;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

const ALL_STATUSES = [...ORDER_STATUSES, "cancelled"];

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (paymentFilter) params.set("payment", paymentFilter);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentFilter]);

  async function updateStatus(orderId: string, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ag-input w-auto"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="ag-input w-auto"
        >
          <option value="">All payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-foreground-muted">
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-foreground-muted">
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              orders.map((order) => (
                <tr key={order.id} className="border-t border-border align-top">
                  <td className="px-4 py-2.5 font-medium text-foreground">#{order.order_number}</td>
                  <td className="px-4 py-2.5">
                    <p>{order.customer_name ?? "—"}</p>
                    <p className="text-xs text-foreground-muted">{order.customer_phone}</p>
                  </td>
                  <td className="max-w-[220px] px-4 py-2.5 text-xs text-foreground-muted">
                    {order.items.map((i) => `${i.packLabel} x${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 py-2.5">₹{order.total}</td>
                  <td className="px-4 py-2.5 capitalize">{order.payment_status}</td>
                  <td className="px-4 py-2.5">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="rounded-md border border-border px-2 py-1 text-xs"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_LABELS[s] ?? s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-foreground-muted">
                    {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                </tr>
              ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-foreground-muted">
                  No orders match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
