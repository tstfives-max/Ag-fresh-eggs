/**
 * Delivery geofencing. This enforces the single most important business rule in the app:
 * AG Fresh Eggs only delivers within a configurable radius of the Danapur base
 * location. This module must be the ONLY place distance/zone math happens — never
 * re-implement Haversine or radius checks inline elsewhere.
 *
 * The radius and base coordinates are read from environment variables, never hardcoded,
 * so ops can widen/move the service area without a code change (see .env.example).
 */

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type DeliveryZoneResult = {
  withinZone: boolean;
  distanceKm: number;
  radiusKm: number;
  message: string;
};

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two lat/lng points, in kilometers.
 */
export function calculateDistance(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_KM * c;
}

function getBaseLocation(): Coordinates {
  const latitude = Number(process.env.BASE_LATITUDE ?? process.env.NEXT_PUBLIC_BASE_LATITUDE);
  const longitude = Number(process.env.BASE_LONGITUDE ?? process.env.NEXT_PUBLIC_BASE_LONGITUDE);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error(
      "BASE_LATITUDE / BASE_LONGITUDE are not configured. Set them in .env.local.",
    );
  }

  return { latitude, longitude };
}

function getRadiusKm(): number {
  const radius = Number(process.env.DELIVERY_RADIUS_KM ?? process.env.NEXT_PUBLIC_DELIVERY_RADIUS_KM);
  return Number.isNaN(radius) ? 3 : radius;
}

/**
 * The single source of truth for "can we deliver here?". Always call this server-side
 * before creating an order or a Razorpay payment order — never trust a client-side-only
 * geofence check, since it can be bypassed.
 */
export function validateDeliveryZone(point: Coordinates): DeliveryZoneResult {
  const base = getBaseLocation();
  const radiusKm = getRadiusKm();
  const distanceKm = calculateDistance(base, point);
  const withinZone = distanceKm <= radiusKm;

  return {
    withinZone,
    distanceKm: Math.round(distanceKm * 100) / 100,
    radiusKm,
    message: withinZone
      ? "You're inside our delivery zone."
      : "AG Fresh Eggs isn't delivering to this location yet.",
  };
}
