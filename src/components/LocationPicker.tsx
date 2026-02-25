"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import type { Location } from "@/data/locations";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { findNearestLocationFromBrowser } from "@/lib/nearest-location";
import {
  getShoppingLocationSlugServerSnapshot,
  getShoppingLocationSlugSnapshot,
  subscribeToShoppingLocationChanges,
  setStoredShoppingLocationSlug,
} from "@/lib/shopping-location";

type Props = {
  locations: Location[];
  mode?: "full" | "minimal";
};

export default function LocationPicker({ locations, mode = "full" }: Props) {
  const router = useRouter();
  const [isFindingNearest, setIsFindingNearest] = useState(false);
  const [nearestMessage, setNearestMessage] = useState<string | null>(null);
  const [nearestError, setNearestError] = useState<string | null>(null);
  const isMinimal = mode === "minimal";
  const selectedSlug = useSyncExternalStore(
    subscribeToShoppingLocationChanges,
    getShoppingLocationSlugSnapshot,
    getShoppingLocationSlugServerSnapshot,
  );

  const selectedLocation = useMemo(
    () => locations.find((location) => location.slug === selectedSlug),
    [locations, selectedSlug],
  );
  const directionsUrl = selectedLocation
    ? getGoogleMapsDirectionsUrl({
        address: selectedLocation.address,
        placeId: selectedLocation.placeId,
      })
    : undefined;

  const handleFindNearestLocation = async () => {
    setIsFindingNearest(true);
    setNearestMessage(null);
    setNearestError(null);

    const result = await findNearestLocationFromBrowser(locations);
    setIsFindingNearest(false);

    if (!result.ok) {
      if (result.reason === "permission-denied") {
        setNearestError(
          "Location access is blocked. Allow location permission in your browser settings.",
        );
        return;
      }

      if (result.reason === "unsupported") {
        setNearestError("Location services are not available in this browser.");
        return;
      }

      if (result.reason === "timeout") {
        setNearestError("Location request timed out. Please try again or select a store manually.");
        return;
      }

      setNearestError("We could not determine your nearest store. Please choose one manually.");
      return;
    }

    const nearestLocation = locations.find((location) => location.slug === result.slug);
    setStoredShoppingLocationSlug(result.slug);
    setNearestMessage(
      nearestLocation
        ? `Nearest store selected: ${nearestLocation.name}.`
        : "Nearest store selected.",
    );
  };

  return (
    <div className="rounded-2xl border border-white/15 bg-black/35 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
        Select Store
      </p>
      <label htmlFor="location-picker" className="mt-2 block text-lg font-semibold text-white">
        Start your order by location
      </label>
      <div className="mt-3 space-y-3">
        <div className="relative max-w-md">
          <select
            id="location-picker"
            value={selectedSlug}
            onChange={(event) => {
              const slug = event.target.value;
              setStoredShoppingLocationSlug(slug);
            }}
            className="brand-input brand-select appearance-none px-4 py-3 pr-11"
          >
            <option value="" disabled>
              Choose a location...
            </option>
            {locations.map((location) => (
              <option key={location.slug} value={location.slug}>
                {location.name}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-brand-yellow"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
              <path d="M5.6 7.5 10 12l4.4-4.5 1.1 1.1-5.5 5.6-5.5-5.6L5.6 7.5Z" />
            </svg>
          </span>
        </div>

        <p className="text-sm text-white/75">Pick a store, then tap Start Order.</p>
        {selectedLocation && (
          <p className="text-xs text-white/70">
            Selected: <span className="font-semibold text-brand-yellow">{selectedLocation.name}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleFindNearestLocation}
          disabled={isFindingNearest}
          className="brand-btn-directions px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isFindingNearest ? "Finding nearest..." : "Use Current Location"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (selectedSlug) {
              setStoredShoppingLocationSlug(selectedSlug);
              router.push(`/menu/${selectedSlug}/embed`);
            }
          }}
          disabled={!selectedSlug}
          className="brand-btn px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          Start Order
        </button>

        {!isMinimal && (
          <>
            <button
              type="button"
              onClick={() => {
                if (selectedSlug) {
                  setStoredShoppingLocationSlug(selectedSlug);
                  router.push(`/locations/${selectedSlug}`);
                }
              }}
              disabled={!selectedSlug}
              className="brand-btn-muted px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45"
            >
              View Location
            </button>

            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-btn-directions px-4 py-2 text-sm"
              >
                Get Directions
              </a>
            ) : (
              <span className="brand-btn-directions px-4 py-2 text-sm opacity-45">
                Get Directions
              </span>
            )}
          </>
        )}
      </div>

      {(nearestMessage || nearestError) && (
        <p
          role={nearestError ? "alert" : "status"}
          className={`mt-3 text-xs ${nearestError ? "text-red-300" : "text-emerald-300"}`}
        >
          {nearestError ?? nearestMessage}
        </p>
      )}
    </div>
  );
}
