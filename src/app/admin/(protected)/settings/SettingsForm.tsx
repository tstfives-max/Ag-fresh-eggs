"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";

type SettingRow = { key: string; value: string };

const FIELDS: Array<{ key: string; label: string; type: "text" | "number" | "boolean" | "date" }> = [
  { key: "delivery_paused", label: "Pause all deliveries", type: "boolean" },
  { key: "min_order_value", label: "Minimum order value (₹)", type: "number" },
  { key: "cod_enabled", label: "Cash on delivery enabled", type: "boolean" },
  { key: "batch_date", label: "Current batch / freshness date", type: "date" },
  { key: "delivery_radius_km", label: "Delivery radius (km) — display only, server env is authoritative", type: "number" },
  { key: "loyalty_every_n_orders", label: "Free pack every N orders", type: "number" },
  { key: "loyalty_reward_pack_label", label: "Loyalty reward pack", type: "text" },
  { key: "referral_discount", label: "Referral discount for new customer (₹)", type: "number" },
  { key: "referral_credit", label: "Referral credit for referrer (₹)", type: "number" },
];

export function SettingsForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        for (const row of (data.settings ?? []) as SettingRow[]) map[row.key] = row.value;
        setValues(map);
        setLoading(false);
      });
  }, []);

  async function save(key: string) {
    setSavingKey(key);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] ?? "" }),
    });
    setSavingKey(null);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);
  }

  if (loading) return <p className="text-sm text-foreground-muted">Loading…</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FIELDS.map((field) => (
        <div key={field.key} className="rounded-2xl border border-border bg-white p-4">
          <label className="text-xs font-medium text-foreground-muted">{field.label}</label>
          <div className="mt-2 flex gap-2">
            {field.type === "boolean" ? (
              <select
                value={values[field.key] ?? "false"}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                className="ag-input"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            ) : (
              <input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                value={values[field.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                className="ag-input"
              />
            )}
            <button
              onClick={() => save(field.key)}
              disabled={savingKey === field.key}
              className="shrink-0 rounded-lg bg-ag-green px-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {savingKey === field.key ? (
                <Loader2 size={14} className="animate-spin" />
              ) : savedKey === field.key ? (
                <Check size={14} />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
