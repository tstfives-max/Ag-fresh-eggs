import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AppSettings = {
  deliveryPaused: boolean;
  minOrderValue: number;
  codEnabled: boolean;
  batchDate: string | null;
  referralDiscount: number;
  referralCredit: number;
  loyaltyEveryNOrders: number;
  loyaltyRewardPackLabel: string;
  deliveryRadiusKm: number;
};

const DEFAULTS: AppSettings = {
  deliveryPaused: false,
  minOrderValue: 0,
  codEnabled: true,
  batchDate: null,
  referralDiscount: 20,
  referralCredit: 20,
  loyaltyEveryNOrders: 5,
  loyaltyRewardPackLabel: "6 Pieces",
  deliveryRadiusKm: Number(process.env.DELIVERY_RADIUS_KM ?? 3),
};

/**
 * Reads admin-configurable settings from the `settings` key/value table.
 * Falls back to sensible defaults if a key is missing so the app never breaks
 * on an incomplete settings table.
 */
export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("settings").select("key, value");

  if (error) {
    throw new Error(`Failed to load settings: ${error.message}`);
  }

  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  return {
    deliveryPaused: map.get("delivery_paused") === "true",
    minOrderValue: Number(map.get("min_order_value") ?? DEFAULTS.minOrderValue),
    codEnabled: (map.get("cod_enabled") ?? "true") === "true",
    batchDate: map.get("batch_date") ?? DEFAULTS.batchDate,
    referralDiscount: Number(map.get("referral_discount") ?? DEFAULTS.referralDiscount),
    referralCredit: Number(map.get("referral_credit") ?? DEFAULTS.referralCredit),
    loyaltyEveryNOrders: Number(
      map.get("loyalty_every_n_orders") ?? DEFAULTS.loyaltyEveryNOrders,
    ),
    loyaltyRewardPackLabel:
      map.get("loyalty_reward_pack_label") ?? DEFAULTS.loyaltyRewardPackLabel,
    deliveryRadiusKm: Number(map.get("delivery_radius_km") ?? DEFAULTS.deliveryRadiusKm),
  };
}
