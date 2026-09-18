import { findNearestLocationSlug } from "@/lib/shopping-location";

type LocationPoint = {
  slug: string;
  latitude: number;
  longitude: number;
};

export type ZipLocationResult =
  | { ok: true; slug: string }
  | {
      ok: false;
      reason: "invalid-zip" | "not-found" | "unavailable" | "timeout" | "no-match" | "cancelled";
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCoordinate(value: unknown, limit: number): number | undefined {
  if (typeof value !== "number" && (typeof value !== "string" || value.trim() === "")) {
    return undefined;
  }

  const coordinate = Number(value);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= limit ? coordinate : undefined;
}

export async function findNearestLocationFromZipCode(
  zipCode: string,
  locationPoints: LocationPoint[],
  signal?: AbortSignal,
): Promise<ZipLocationResult> {
  const normalizedZipCode = zipCode.trim();
  if (!/^\d{5}$/.test(normalizedZipCode)) {
    return { ok: false, reason: "invalid-zip" };
  }

  if (locationPoints.length === 0) {
    return { ok: false, reason: "no-match" };
  }

  if (signal?.aborted) {
    return { ok: false, reason: "cancelled" };
  }

  const controller = new AbortController();
  let timedOut = false;
  const cancelRequest = (): void => controller.abort();
  signal?.addEventListener("abort", cancelRequest, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 8000);

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${normalizedZipCode}`, {
      signal: controller.signal,
    });

    if (response.status === 404) {
      return { ok: false, reason: "not-found" };
    }

    if (!response.ok) {
      return { ok: false, reason: "unavailable" };
    }

    const data: unknown = await response.json();
    if (!isRecord(data) || !Array.isArray(data.places)) {
      return { ok: false, reason: "unavailable" };
    }

    if (data.places.length === 0) {
      return { ok: false, reason: "not-found" };
    }

    for (const place of data.places) {
      if (!isRecord(place)) {
        continue;
      }

      const latitude = parseCoordinate(place.latitude, 90);
      const longitude = parseCoordinate(place.longitude, 180);
      if (latitude === undefined || longitude === undefined) {
        continue;
      }

      const slug = findNearestLocationSlug(latitude, longitude, locationPoints);
      return slug ? { ok: true, slug } : { ok: false, reason: "no-match" };
    }

    return { ok: false, reason: "unavailable" };
  } catch {
    if (signal?.aborted) {
      return { ok: false, reason: "cancelled" };
    }

    return { ok: false, reason: timedOut ? "timeout" : "unavailable" };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancelRequest);
  }
}
