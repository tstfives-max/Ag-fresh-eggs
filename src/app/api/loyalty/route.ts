import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAppSettings } from "@/lib/services/settings";

/**
 * Loyalty progress for a phone number: "every Nth completed order earns a free pack",
 * with N and the reward pack label read from `settings` (admin-configurable), never
 * hardcoded. Also returns the customer's referral code/credit for the Rewards screen.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Missing or invalid phone." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const settings = await getAppSettings();

  const [{ count: paidOrderCount }, { data: customer }] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_phone", phone)
      .eq("payment_status", "paid"),
    supabase.from("customers").select("*").eq("phone", phone).maybeSingle(),
  ]);

  const completed = paidOrderCount ?? 0;
  const everyN = settings.loyaltyEveryNOrders;
  const progress = completed % everyN;
  const ordersUntilReward = progress === 0 && completed > 0 ? 0 : everyN - progress;

  return NextResponse.json({
    completedOrders: completed,
    everyN,
    progress,
    ordersUntilReward,
    rewardPackLabel: settings.loyaltyRewardPackLabel,
    referralCode: customer?.referral_code ?? null,
    referralDiscount: settings.referralDiscount,
    referralCredit: settings.referralCredit,
    creditBalance: customer?.credit_balance ?? 0,
  });
}
