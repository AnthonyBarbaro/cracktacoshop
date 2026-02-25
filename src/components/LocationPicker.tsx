"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Location } from "@/data/locations";
import {
  getStoredShoppingLocationSlug,
  setStoredShoppingLocationSlug,
} from "@/lib/shopping-location";

type Props = {
  locations: Location[];
};

export default function LocationPicker({ locations }: Props) {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string>(
    () => getStoredShoppingLocationSlug() ?? "",
  );
  const selectedLocation = useMemo(
    () => locations.find((location) => location.slug === selectedSlug),
    [locations, selectedSlug],
  );
  const directionsUrl = selectedLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.address)}`
    : undefined;

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
              setSelectedSlug(slug);
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
      </div>
    </div>
  );
}
