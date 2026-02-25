import { findNearestLocationSlug } from "@/lib/shopping-location";

type LocationPoint = {
  slug: string;
  latitude: number;
  longitude: number;
};

export type NearestLocationResult =
  | { ok: true; slug: string }
  | {
      ok: false;
      reason: "unsupported" | "permission-denied" | "timeout" | "unavailable" | "no-match";
    };

type NearestLocationFailureReason = Extract<NearestLocationResult, { ok: false }>["reason"];

function hasBrowserGeolocation(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && !!navigator.geolocation;
}

function getCurrentPosition(
  options: PositionOptions,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function mapGeolocationError(error: GeolocationPositionError): NearestLocationFailureReason {
  if (error.code === error.PERMISSION_DENIED) {
    return "permission-denied";
  }

  if (error.code === error.TIMEOUT) {
    return "timeout";
  }

  return "unavailable";
}

async function canUseGeolocation(): Promise<{
  allowed: boolean;
  reason?: "unsupported" | "permission-denied";
}> {
  if (!hasBrowserGeolocation()) {
    return { allowed: false, reason: "unsupported" };
  }

  if (!("permissions" in navigator) || typeof navigator.permissions.query !== "function") {
    return { allowed: true };
  }

  try {
    const status = await navigator.permissions.query({
      name: "geolocation",
    } as PermissionDescriptor);

    if (status.state === "denied") {
      return { allowed: false, reason: "permission-denied" };
    }
  } catch {
    // Ignore permissions API errors and continue with direct geolocation request.
  }

  return { allowed: true };
}

function pickNearestSlug(
  latitude: number,
  longitude: number,
  locationPoints: LocationPoint[],
): string | undefined {
  return findNearestLocationSlug(latitude, longitude, locationPoints);
}

export async function findNearestLocationFromBrowser(
  locationPoints: LocationPoint[],
): Promise<NearestLocationResult> {
  if (locationPoints.length === 0) {
    return { ok: false, reason: "no-match" };
  }

  const geolocationStatus = await canUseGeolocation();
  if (!geolocationStatus.allowed) {
    return { ok: false, reason: geolocationStatus.reason ?? "unsupported" };
  }

  try {
    // Try a fast cached lookup first to reduce timeouts on mobile networks.
    const quickPosition = await getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 5 * 60 * 1000,
    });

    const quickMatch = pickNearestSlug(
      quickPosition.coords.latitude,
      quickPosition.coords.longitude,
      locationPoints,
    );

    if (quickMatch) {
      return { ok: true, slug: quickMatch };
    }
  } catch (error) {
    const geolocationError = error as GeolocationPositionError;

    if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
      return { ok: false, reason: "permission-denied" };
    }
  }

  try {
    // Fall back to a more accurate lookup when quick mode is unavailable.
    const precisePosition = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });

    const preciseMatch = pickNearestSlug(
      precisePosition.coords.latitude,
      precisePosition.coords.longitude,
      locationPoints,
    );

    if (!preciseMatch) {
      return { ok: false, reason: "no-match" };
    }

    return { ok: true, slug: preciseMatch };
  } catch (error) {
    return {
      ok: false,
      reason: mapGeolocationError(error as GeolocationPositionError),
    };
  }
}
