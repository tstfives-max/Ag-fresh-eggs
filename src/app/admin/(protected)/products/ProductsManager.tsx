"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import type { Tables } from "@/types/database";

type Product = Tables<"products">;
type PriceHistoryRow = Tables<"price_history">;

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [history, setHistory] = useState<PriceHistoryRow[]>([]);

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

  async function savePrice(product: Product) {
    const raw = edits[product.id];
    const newPrice = raw !== undefined ? Number(raw) : product.price;
    if (Number.isNaN(newPrice) || newPrice <= 0) return;

    setSaving(product.id);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: newPrice }),
    });
    setSaving(null);
    setEdits((e) => {
      const next = { ...e };
      delete next[product.id];
      return next;
    });
    load();
  }

  async function viewHistory(productId: string) {
    setHistoryFor(productId);
    const res = await fetch(`/api/admin/products/${productId}`);
    const data = await res.json();
    setHistory(data.history ?? []);
  }

  if (loading) return <p className="text-sm text-foreground-muted">Loading…</p>;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const editValue = edits[product.id] ?? String(product.price);
          const dirty = editValue !== String(product.price);
          return (
            <div key={product.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{product.pack_label}</p>
                  <p className="text-xs text-foreground-muted">{product.pieces} eggs</p>
                </div>
                <button
                  onClick={() => viewHistory(product.id)}
                  className="text-foreground-muted hover:text-foreground"
                  title="Price history"
                >
                  <History size={16} />
                </button>
              </div>

              <label className="mt-3 block text-xs text-foreground-muted">Price (₹)</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [product.id]: e.target.value }))}
                  className="ag-input"
                />
                <button
                  onClick={() => savePrice(product)}
                  disabled={!dirty || saving === product.id}
                  className="shrink-0 rounded-lg bg-ag-green px-3 text-sm font-medium text-white disabled:opacity-40"
                >
                  {saving === product.id ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                </button>
                {dirty && (
                  <button
                    onClick={() => setEdits((e) => ({ ...e, [product.id]: String(product.price) }))}
                    className="shrink-0 rounded-lg border border-border px-3 text-sm text-foreground-muted"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {historyFor === product.id && (
                <div className="mt-3 rounded-lg bg-surface p-2 text-xs">
                  {history.length === 0 && <p className="text-foreground-muted">No price changes yet.</p>}
                  {history.map((h) => (
                    <div key={h.id} className="flex justify-between py-0.5">
                      <span>
                        ₹{h.old_price} → ₹{h.new_price}
                      </span>
                      <span className="text-foreground-muted">
                        {new Date(h.changed_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
