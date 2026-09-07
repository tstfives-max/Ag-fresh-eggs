import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [{ data: order }, { data: history }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", id)
      .order("changed_at", { ascending: true }),
  ]);

  if (!order) notFound();

  const isCancelled = order.status === "cancelled";
  const currentIndex = ORDER_STATUSES.indexOf(order.status as (typeof ORDER_STATUSES)[number]);
  const timestampFor = (status: string) => history?.find((h) => h.status === status)?.changed_at;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground">Track Order</h1>
      <p className="mt-1 text-sm text-foreground-muted">Order #{order.order_number}</p>

      {isCancelled ? (
        <p className="mt-6 rounded-xl bg-danger/5 p-4 text-sm text-danger">
          This order was cancelled.
        </p>
      ) : (
        <ol className="mt-8 flex flex-col">
          {ORDER_STATUSES.map((status, i) => {
            const done = i <= currentIndex;
            const timestamp = timestampFor(status);
            return (
              <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
                {i < ORDER_STATUSES.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[15px] top-8 h-full w-0.5",
                      done && i < currentIndex ? "bg-ag-green" : "bg-border",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    done ? "bg-ag-green text-white" : "bg-surface text-foreground-muted",
                  )}
                >
                  {done ? <Check size={16} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                </span>
                <div>
                  <p className={cn("font-medium", done ? "text-foreground" : "text-foreground-muted")}>
                    {ORDER_STATUS_LABELS[status]}
                  </p>
                  {timestamp && (
                    <p className="text-xs text-foreground-muted">
                      {new Date(timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-white p-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-foreground-muted">Delivery address</span>
          <span className="max-w-[60%] text-right">{order.address}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-foreground-muted">Total</span>
          <span className="font-medium">₹{order.total}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-foreground-muted">Payment</span>
          <span className="font-medium capitalize">{order.payment_status}</span>
        </div>
      </div>
    </div>
  );
}
