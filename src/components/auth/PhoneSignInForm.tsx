"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile number sign-in via SMS OTP (Supabase Auth Phone provider). Two steps:
 * enter phone -> send code, enter code -> verify. On success this is a REAL
 * verified identity (unlike the old "just type your number" order lookup), so
 * we immediately link it to `customers.auth_user_id` and remember it locally
 * the same way Google sign-in does — Orders/Profile then just work.
 *
 * Requires an SMS provider configured in Supabase (Twilio, etc.) — see
 * PHONE_LOGIN_SETUP.md. Until that's done this form will show a real error
 * from Supabase when "Send code" is pressed (not a silent failure).
 */
export function PhoneSignInForm({
  onSignedIn,
  className,
}: {
  onSignedIn?: (phone: string) => void;
  className?: string;
}) {
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp() {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStage("otp");
  }

  async function verifyOtp() {
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }

    try {
      localStorage.setItem("ag-fresh-eggs-phone", phone);
    } catch {
      // localStorage unavailable — non-critical
    }
    // Best-effort: ties this verified phone to the auth account so order
    // history is findable on any device just by signing in again.
    fetch("/api/account/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }).catch(() => {});

    onSignedIn?.(phone);
  }

  if (stage === "phone") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex gap-2">
          <span className="ag-input flex w-16 items-center justify-center px-0 text-sm text-foreground-muted">
            +91
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            className="ag-input flex-1"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button onClick={sendOtp} disabled={loading} className="w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Send OTP
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-foreground-muted">
        Code sent to +91 {phone}.{" "}
        <button type="button" onClick={() => setStage("phone")} className="text-ag-green underline">
          Change number
        </button>
      </p>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="6-digit code"
        inputMode="numeric"
        className="ag-input"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button onClick={verifyOtp} disabled={loading} className="w-full">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        Verify & sign in
      </Button>
    </div>
  );
}
