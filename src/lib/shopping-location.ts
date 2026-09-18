import {
  COOKIE_PREFERENCE_CHANGE_EVENT,
  COOKIE_PREFERENCE_STORAGE_KEY,
  getCookiePreferenceSnapshot,
} from "@/lib/cookie-preferences";

type LocationPoint = {
  slug: string;
  latitude: number;
  longitude: number;
};

export const SHOPPING_LOCATION_STORAGE_KEY = "cts-shopping-location-slug";
export const SHOPPING_LOCATION_CHANGE_EVENT = "cts-shopping-location-change";
const SHOPPING_LOCATION_STORAGE_EVENT = "storage";
let currentLocationSlug: string | undefined;
let hasTemporaryLocation = false;

function persistShoppingLocation(): void {
  try {
    if (getCookiePreferenceSnapshot() === "enabled") {
      if (currentLocationSlug) {
        window.localStorage.setItem(SHOPPING_LOCATION_STORAGE_KEY, currentLocationSlug);
        hasTemporaryLocation = false;
      }
    } else {
      window.localStorage.removeItem(SHOPPING_LOCATION_STORAGE_KEY);
    }
  } catch {
    // Store selection remains available in memory when storage is blocked.
  }
}

export function getStoredShoppingLocationSlug(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (getCookiePreferenceSnapshot() === "enabled" && !hasTemporaryLocation) {
    try {
      currentLocationSlug = window.localStorage.getItem(SHOPPING_LOCATION_STORAGE_KEY) ?? currentLocationSlug;
    } catch {
      // Use the selection from this visit when storage is unavailable.
    }
  }

  return currentLocationSlug;
}

export function setStoredShoppingLocationSlug(slug: string): void {
  if (typeof window === "undefined") {
    return;
  }

  currentLocationSlug = slug;
  hasTemporaryLocation = true;
  persistShoppingLocation();
  window.dispatchEvent(new CustomEvent(SHOPPING_LOCATION_CHANGE_EVENT, { detail: { slug } }));
}

export function subscribeToShoppingLocationChanges(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => {
    callback();
  };
  const handlePreferenceChange = (): void => {
    persistShoppingLocation();
    callback();
  };
  const handleStorage = (event: StorageEvent): void => {
    if (event.key === null) {
      currentLocationSlug = undefined;
      hasTemporaryLocation = false;
      callback();
    } else if (event.key === COOKIE_PREFERENCE_STORAGE_KEY) {
      if (getCookiePreferenceSnapshot() !== "enabled") {
        persistShoppingLocation();
      }
      callback();
    } else if (event.key === SHOPPING_LOCATION_STORAGE_KEY) {
      if (getCookiePreferenceSnapshot() === "enabled") {
        currentLocationSlug = event.newValue ?? undefined;
        hasTemporaryLocation = false;
      }
      callback();
    }
  };

  window.addEventListener(SHOPPING_LOCATION_CHANGE_EVENT, handler as EventListener);
  window.addEventListener(COOKIE_PREFERENCE_CHANGE_EVENT, handlePreferenceChange);
  window.addEventListener(SHOPPING_LOCATION_STORAGE_EVENT, handleStorage);

  return () => {
    window.removeEventListener(SHOPPING_LOCATION_CHANGE_EVENT, handler as EventListener);
    window.removeEventListener(COOKIE_PREFERENCE_CHANGE_EVENT, handlePreferenceChange);
    window.removeEventListener(SHOPPING_LOCATION_STORAGE_EVENT, handleStorage);
  };
}

export function getShoppingLocationSlugSnapshot(): string {
  return getStoredShoppingLocationSlug() ?? "";
}

export function getShoppingLocationSlugServerSnapshot(): string {
  return "";
}

function getDistanceInKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(latitudeB - latitudeA);
  const dLon = toRadians(longitudeB - longitudeA);
  const lat1 = toRadians(latitudeA);
  const lat2 = toRadians(latitudeB);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const a = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function findNearestLocationSlug(
  latitude: number,
  longitude: number,
  locationPoints: LocationPoint[],
): string | undefined {
  if (locationPoints.length === 0) {
    return undefined;
  }

  let nearest = locationPoints[0];
  let shortestDistance = getDistanceInKm(
    latitude,
    longitude,
    nearest.latitude,
    nearest.longitude,
  );

  for (const locationPoint of locationPoints.slice(1)) {
    const distance = getDistanceInKm(
      latitude,
      longitude,
      locationPoint.latitude,
      locationPoint.longitude,
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearest = locationPoint;
    }
  }

  return nearest.slug;
}
