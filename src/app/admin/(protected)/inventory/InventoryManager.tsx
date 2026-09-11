"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Tables } from "@/types/database";

type Product = Tables<"products">;

function stockLabel(p: Product) {
  if (!p.in_stock) return { text: "Sold Out", tone: "danger" as const };
  if (p.stock_qty !== null && p.stock_qty <= 0) return { text: "Sold Out", tone: "danger" as const };
  if (p.stock_qty !== null && p.stock_qty <= p.low_stock_threshold)
    return { text: "Low Stock", tone: "warning" as const };
  return { text: "Available", tone: "success" as const };
}

export function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStock(product: Product, stockQty: number | null) {
    setSaving(product.id);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_qty: stockQty, in_stock: stockQty === null || stockQty > 0 }),
    });
    setSaving(null);
    load();
  }

  async function toggleAvailability(product: Product) {
    setSaving(product.id);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ in_stock: !product.in_stock }),
    });
    setSaving(null);
    load();
  }

  if (loading) return <p className="text-sm text-foreground-muted">Loading…</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-foreground-muted">
            <th className="px-4 py-2">Pack</th>
            <th className="px-4 py-2">Stock Qty</th>
            <th className="px-4 py-2">Low Stock Alert Below</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Available</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = stockLabel(product);
            return (
              <tr key={product.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium text-foreground">{product.pack_label}</td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    min={0}
                    defaultValue={product.stock_qty ?? ""}
                    placeholder="Unlimited"
                    onBlur={(e) =>
                      updateStock(product, e.target.value === "" ? null : Number(e.target.value))
                    }
                    className="w-24 rounded-md border border-border px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2.5 text-foreground-muted">{product.low_stock_threshold}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      status.tone === "danger" && "bg-danger/10 text-danger",
                      status.tone === "warning" && "bg-warning/10 text-warning",
                      status.tone === "success" && "bg-ag-green/10 text-ag-green",
                    )}
                  >
                    {status.text}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => toggleAvailability(product)}
                    disabled={saving === product.id}
                    className={cn(
                      "flex h-6 w-11 items-center rounded-full transition-colors",
                      product.in_stock ? "bg-ag-green" : "bg-border",
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full bg-white shadow transition-transform",
                        product.in_stock ? "translate-x-5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                  {saving === product.id && <Loader2 size={12} className="ml-2 inline animate-spin" />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
