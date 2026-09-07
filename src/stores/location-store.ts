"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocationState = {
  latitude: number | null;
  longitude: number | null;
  addressText: string;
  distanceKm: number | null;
  withinZone: boolean | null;
  radiusKm: number | null;
  checkedAt: number | null;
  setLocation: (data: Partial<Omit<LocationState, "setLocation" | "clear">>) => void;
  clear: () => void;
};

/**
 * Persists the customer's last known location + geofence result across the app
 * (location check -> home -> cart -> checkout). This is a UX convenience only —
 * checkout MUST re-run validateDeliveryZone() server-side before payment, since
 * this client state can be stale or tampered with.
 */
export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      addressText: "",
      distanceKm: null,
      withinZone: null,
      radiusKm: null,
      checkedAt: null,
      setLocation: (data) => set({ ...data, checkedAt: Date.now() }),
      clear: () =>
        set({
          latitude: null,
          longitude: null,
          addressText: "",
          distanceKm: null,
          withinZone: null,
          radiusKm: null,
          checkedAt: null,
        }),
    }),
    { name: "ag-fresh-eggs-location" },
  ),
);
