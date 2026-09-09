"use client";

import { useEffect, useState } from "react";
import { Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/constants";

type Loyalty = {
  completedOrders: number;
  everyN: number;
  progress: number;
  ordersUntilReward: number;
  rewardPackLabel: string;
  referralCode: string | null;
  referralDiscount: number;
  referralCredit: number;
  creditBalance: number;
};

export default function RewardsPage() {
  const [phone, setPhone] = useState<string | null>(null);
  const [data, setData] = useState<Loyalty | null>(null);

  useEffect(() => {
    try {
      setPhone(localStorage.getItem("ag-fresh-eggs-phone"));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!phone) return;
    fetch(`/api/loyalty?phone=${phone}`)
      .then((r) => r.json())
      .then(setData);
  }, [phone]);

  if (!phone) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <Gift size={28} className="mx-auto text-foreground-muted" />
        <h1 className="mt-3 font-display text-xl font-semibold text-foreground">AG Rewards</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Place an order to start earning rewards.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const dots = Array.from({ length: data.everyN }, (_, i) => i < data.progress);

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">AG Rewards</h1>

      <div className="mt-5 rounded-2xl border border-border bg-white p-5">
        <p className="font-medium text-foreground">
          {data.progress} / {data.everyN} Orders Completed
        </p>
        <div className="mt-3 flex gap-2">
          {dots.map((filled, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full ${filled ? "bg-ag-green" : "bg-border"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-foreground-muted">
          {data.ordersUntilReward === 0
            ? `You've unlocked a free ${data.rewardPackLabel}! It'll be applied on your next order.`
            : `${data.ordersUntilReward} more order${data.ordersUntilReward === 1 ? "" : "s"} to unlock a free ${data.rewardPackLabel}.`}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-white p-5">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <Share2 size={16} className="text-ag-blue" /> Refer & Earn
        </p>
        <p className="mt-1 text-sm text-foreground-muted">
          Share your code — you both get ₹{data.referralCredit} off.
        </p>
        {data.referralCode && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-surface px-3 py-2">
            <span className="font-mono font-semibold text-foreground">{data.referralCode}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open(
                  buildWhatsAppLink(
                    `AG Fresh Eggs try karo! Mera referral code ${data.referralCode} use karke apne pehle order par ₹${data.referralDiscount} off pao. https://ag-fresh-eggs.vercel.app`,
                  ),
                  "_blank",
                )
              }
            >
              Share
            </Button>
          </div>
        )}
        {data.creditBalance > 0 && (
          <p className="mt-2 text-xs text-ag-green">
            You have ₹{data.creditBalance} in referral credit.
          </p>
        )}
      </div>
    </div>
  );
}
