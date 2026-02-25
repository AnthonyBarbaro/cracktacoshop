type LocationPoint = {
  slug: string;
  latitude: number;
  longitude: number;
};

export const SHOPPING_LOCATION_STORAGE_KEY = "cts-shopping-location-slug";
export const SHOPPING_LOCATION_CHANGE_EVENT = "cts-shopping-location-change";

export function getStoredShoppingLocationSlug(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const value = window.localStorage.getItem(SHOPPING_LOCATION_STORAGE_KEY);
  return value ?? undefined;
}

export function setStoredShoppingLocationSlug(slug: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SHOPPING_LOCATION_STORAGE_KEY, slug);
  window.dispatchEvent(new CustomEvent(SHOPPING_LOCATION_CHANGE_EVENT, { detail: { slug } }));
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
