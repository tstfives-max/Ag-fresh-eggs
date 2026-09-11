import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = createAdminSupabaseClient();
  const [{ data: customers }, { data: orders }] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("customer_phone, total, payment_status, created_at"),
  ]);

  const statsByPhone = new Map<string, { orders: number; spend: number; last: string }>();
  for (const order of orders ?? []) {
    if (!order.customer_phone || order.payment_status !== "paid") continue;
    const existing = statsByPhone.get(order.customer_phone) ?? { orders: 0, spend: 0, last: order.created_at };
    existing.orders += 1;
    existing.spend += Number(order.total);
    if (order.created_at > existing.last) existing.last = order.created_at;
    statsByPhone.set(order.customer_phone, existing);
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-foreground">Customers</h1>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-foreground-muted">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Orders</th>
              <th className="px-4 py-2">Total Spend</th>
              <th className="px-4 py-2">Last Order</th>
              <th className="px-4 py-2">Business</th>
              <th className="px-4 py-2">Referral Code</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((customer) => {
              const stats = statsByPhone.get(customer.phone);
              return (
                <tr key={customer.phone} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium text-foreground">{customer.name ?? "—"}</td>
                  <td className="px-4 py-2.5">{customer.phone}</td>
                  <td className="px-4 py-2.5">{stats?.orders ?? 0}</td>
                  <td className="px-4 py-2.5">₹{stats?.spend ?? 0}</td>
                  <td className="px-4 py-2.5 text-foreground-muted">
                    {stats ? new Date(stats.last).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-2.5">{customer.is_business ? "Yes" : "No"}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{customer.referral_code ?? "—"}</td>
                </tr>
              );
            })}
            {(customers ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-foreground-muted">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
