"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocationStore } from "@/stores/location-store";
import { buildWhatsAppLink } from "@/lib/constants";

type Status = "idle" | "locating" | "checking" | "done" | "error";

export function LocationChecker() {
  const router = useRouter();
  const setLocation = useLocationStore((s) => s.setLocation);
  // Select primitives individually rather than returning a new object from the
  // selector — an object literal is a new reference every call, which breaks
  // useSyncExternalStore's snapshot caching (infinite-loop warning).
  const withinZone = useLocationStore((s) => s.withinZone);
  const distanceKm = useLocationStore((s) => s.distanceKm);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");

  async function checkCoordinates(latitude: number, longitude: number) {
    setStatus("checking");
    try {
      const res = await fetch("/api/geo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!res.ok) throw new Error("validation_failed");
      const data = await res.json();
      setLocation({
        latitude,
        longitude,
        addressText: manualAddress,
        distanceKm: data.distanceKm,
        withinZone: data.withinZone,
        radiusKm: data.radiusKm,
      });
      setStatus("done");
    } catch {
      setErrorMessage("Something went wrong checking your location. Please try again.");
      setStatus("error");
    }
  }

  function useMyLocation() {
    setErrorMessage(null);
    if (!("geolocation" in navigator)) {
      setErrorMessage("Your browser doesn't support location access. Please enter your address manually.");
      setStatus("error");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        checkCoordinates(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setErrorMessage(
          "We couldn't access your location. Please allow location access, or enter your address manually below.",
        );
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const isBusy = status === "locating" || status === "checking";

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Where should we deliver?
      </h1>
      <p className="mt-2 text-sm text-foreground-muted">
        AG Fresh Eggs currently delivers only within 3 KM of Danapur, Patna – 801503.
      </p>

      <Button
        onClick={useMyLocation}
        disabled={isBusy}
        size="lg"
        className="mt-6 w-full"
      >
        {isBusy ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <LocateFixed size={18} />
        )}
        {status === "locating"
          ? "Getting your location…"
          : status === "checking"
            ? "Checking delivery zone…"
            : "Use my current location"}
      </Button>

      {status === "done" && withinZone !== null && (
        <div
          className={`mt-5 flex items-start gap-2.5 rounded-xl border p-4 ${
            withinZone
              ? "border-ag-green/30 bg-ag-green/5"
              : "border-danger/30 bg-danger/5"
          }`}
        >
          {withinZone ? (
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-ag-green" />
          ) : (
            <XCircle size={20} className="mt-0.5 shrink-0 text-danger" />
          )}
          <div>
            <p className={`font-medium ${withinZone ? "text-ag-green" : "text-danger"}`}>
              {withinZone
                ? "You're inside our delivery zone."
                : "AG Fresh Eggs isn't delivering to this location yet."}
            </p>
            <p className="mt-1 text-sm text-foreground-muted">
              You&apos;re about {distanceKm} km from Danapur.
              {!withinZone && " Please choose an address within 3 KM."}
            </p>
            {withinZone ? (
              <Button size="sm" className="mt-3" onClick={() => router.push("/shop")}>
                Continue to Shop
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() =>
                  window.open(
                    buildWhatsAppLink(
                      "Hi AG Enterprises, I'd like to check if you deliver to my area (outside the 3 KM zone shown in the app).",
                    ),
                    "_blank",
                  )
                }
              >
                Ask on WhatsApp
              </Button>
            )}
          </div>
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-4 rounded-lg bg-danger/5 p-3 text-sm text-danger">{errorMessage}</p>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <label className="text-sm font-medium text-foreground" htmlFor="manual-address">
          Or enter your address manually
        </label>
        <textarea
          id="manual-address"
          rows={2}
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          placeholder="House no, street, landmark, Danapur, Patna"
          className="mt-2 w-full resize-none rounded-lg border border-border p-3 text-sm outline-none focus:border-ag-green"
        />
        <p className="mt-1.5 text-xs text-foreground-muted">
          We&apos;ll still confirm your exact delivery zone using your device location before
          checkout completes.
        </p>
      </div>
    </div>
  );
}
