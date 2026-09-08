"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cartSubtotal, useCartStore } from "@/stores/cart-store";
import { useLocationStore } from "@/stores/location-store";
import { loadRazorpayScript } from "@/lib/razorpay-checkout";
import { registerPushTokenForPhone, getPushToken } from "@/lib/push-notifications";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { cn } from "@/lib/utils/cn";

const STEPS = ["Details", "Address", "Summary", "Payment"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const location = useLocationStore();
  const { user: googleUser } = useAuthUser();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAddress(location.addressText ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autofill from a signed-in Google account, but only into an empty field — never
  // clobbers something the customer already typed (e.g. they signed in mid-checkout).
  useEffect(() => {
    if (googleUser?.name && !name) setName(googleUser.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleUser]);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  if (!mounted) return null;

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  if (location.withinZone !== true) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="rounded-xl bg-danger/5 p-4 text-sm text-danger">
          You&apos;re currently outside our 3 KM delivery area. Please confirm a delivery
          address inside the zone before checking out.
        </p>
        <Button className="mt-4" onClick={() => router.push("/location")}>
          Check delivery zone
        </Button>
      </div>
    );
  }

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (name.trim().length < 2) next.name = "Please enter your name.";
      if (!/^[6-9]\d{9}$/.test(phone.trim())) next.phone = "Enter a valid 10-digit mobile number.";
    }
    if (step === 1) {
      if (address.trim().length < 8) next.address = "Please enter a complete address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handlePay() {
    setPayError(null);
    setPaying(true);
    try {
      if (location.latitude === null || location.longitude === null) {
        throw new Error("Location not confirmed. Please recheck your delivery zone.");
      }

      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          address,
          latitude: location.latitude,
          longitude: location.longitude,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error ?? "Could not start payment.");

      await loadRazorpayScript();

      const razorpay = new window.Razorpay({
        key: createData.keyId,
        amount: Math.round(createData.amount * 100),
        currency: createData.currency,
        name: "AG Fresh Eggs",
        description: `Order #${createData.orderNumber}`,
        order_id: createData.razorpayOrderId,
        prefill: { name, contact: phone },
        theme: { color: "#2E7D32" },
        handler: async (response: unknown) => {
          const r = response as {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          };
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: createData.orderId,
                razorpay_order_id: r.razorpay_order_id,
                razorpay_payment_id: r.razorpay_payment_id,
                razorpay_signature: r.razorpay_signature,
                // Included so the server can register it against this order's phone and
                // send the "order confirmed" push in the same request — waiting for a
                // separate post-success call to land would race the push send.
                fcmToken: getPushToken() ?? undefined,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              setPayError(verifyData.error ?? "Payment wasn't completed. Your cart is safe.");
              setPaying(false);
              return;
            }
            clearCart();
            try {
              localStorage.setItem("ag-fresh-eggs-phone", phone);
            } catch {
              // localStorage unavailable (private browsing etc.) — non-critical
            }
            // Best-effort — ties this device's FCM token to the phone so the "order
            // confirmed" push (sent server-side, right after this same verify call
            // succeeds) actually has somewhere to land. Never blocks navigation.
            void registerPushTokenForPhone(phone);
            router.push(`/order-confirmation/${createData.orderId}`);
          } catch {
            setPayError("Payment wasn't completed. Your cart is safe.");
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      razorpay.on("payment.failed", () => {
        setPayError("Payment wasn't completed. Your cart is safe.");
        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPaying(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Checkout</h1>

      {/* Progress indicator */}
      <div className="mt-5 flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                  i < step
                    ? "bg-ag-green text-white"
                    : i === step
                      ? "bg-ag-green/10 text-ag-green ring-2 ring-ag-green"
                      : "bg-surface text-foreground-muted",
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-[10px] text-foreground-muted">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-1.5 h-0.5 flex-1", i < step ? "bg-ag-green" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            {!googleUser && (
              <GoogleSignInButton
                next="/checkout"
                label="Sign in with Google to autofill your details"
                className="w-full"
              />
            )}
            <Field label="Full name" error={errors.name}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="ag-input"
              />
            </Field>
            <Field label="Mobile number" error={errors.phone}>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                className="ag-input"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Field label="Delivery address" error={errors.address}>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no, street, landmark, Danapur, Patna – 801503"
                className="ag-input resize-none"
              />
            </Field>
            <p className="rounded-lg bg-ag-green/5 px-3 py-2 text-xs text-ag-green">
              You&apos;re about {location.distanceKm} km from Danapur — inside the
              delivery zone.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-white p-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between py-1.5 text-sm">
                  <span>
                    {item.packLabel} × {item.quantity}
                  </span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-border pt-2 text-sm text-foreground-muted">
                <div className="flex justify-between">
                  <span>Delivering to</span>
                  <span className="max-w-[60%] text-right">{address}</span>
                </div>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-white p-4 text-center">
              <p className="text-sm text-foreground-muted">Amount payable</p>
              <p className="mt-1 text-3xl font-bold text-foreground">₹{subtotal}</p>
            </div>
            {payError && (
              <p className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">{payError}</p>
            )}
            <Button size="lg" onClick={handlePay} disabled={paying}>
              {paying ? <Loader2 size={18} className="animate-spin" /> : null}
              {paying ? "Processing…" : `Pay ₹${subtotal} securely`}
            </Button>
            <p className="text-center text-xs text-foreground-muted">
              Payments are processed securely via Razorpay (UPI, cards, net banking, wallets).
            </p>
          </div>
        )}
      </div>

      {step < 3 && (
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button className="flex-1" onClick={goNext}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}
