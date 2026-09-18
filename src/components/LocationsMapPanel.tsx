"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import type { Location } from "@/data/locations";
import {
  getShoppingLocationSlugServerSnapshot,
  getShoppingLocationSlugSnapshot,
  setStoredShoppingLocationSlug,
  subscribeToShoppingLocationChanges,
} from "@/lib/shopping-location";
import {
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  getGoogleMapsSearchUrl,
} from "@/lib/google-maps";
import LocationOpenBadge from "@/components/LocationOpenBadge";

type Props = {
  locations: Location[];
};

export default function LocationsMapPanel({ locations }: Props) {
  const selectedSlug = useSyncExternalStore(
    subscribeToShoppingLocationChanges,
    getShoppingLocationSlugSnapshot,
    getShoppingLocationSlugServerSnapshot,
  );
  const activeLocation =
    locations.find((location) => location.slug === selectedSlug) ?? locations[0];

  if (!activeLocation) {
    return null;
  }

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const embedSrc = getGoogleMapsEmbedUrl({
    address: activeLocation.address,
    placeId: activeLocation.placeId,
    apiKey: googleMapsApiKey,
  });
  const directionsUrl = getGoogleMapsDirectionsUrl({
    address: activeLocation.address,
    placeId: activeLocation.placeId,
    googleMapsUrl: activeLocation.googleMapsUrl,
  });
  const googleListingUrl = getGoogleMapsSearchUrl({
    address: activeLocation.address,
    placeId: activeLocation.placeId,
    googleMapsUrl: activeLocation.googleMapsUrl,
  });

  return (
    <div>
      <h2 className="sr-only">Find a location on the map</h2>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {locations.map((location) => {
            const isSelected = location.slug === activeLocation.slug;

            return (
              <button
                key={location.slug}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setStoredShoppingLocationSlug(location.slug);
                }}
                className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-brand-green bg-green-50"
                    : "border-neutral-200 bg-white hover:border-brand-green"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-xl text-neutral-950">{location.name}</p>
                  <LocationOpenBadge slug={location.slug} />
                </div>
                <p className="mt-1 text-xs text-neutral-600">{location.address}</p>
                <p className="mt-1 text-xs text-neutral-600">{location.hours}</p>
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="relative min-h-72">
            <iframe
              title={`${activeLocation.name} map`}
              src={embedSrc}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="border-t border-neutral-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-2xl text-neutral-950">{activeLocation.name}</p>
                <p className="mt-1 text-sm text-neutral-600">{activeLocation.address}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-btn-directions px-4 py-2 text-sm"
              >
                Get Directions
              </a>
              <Link
                href={`/locations/${activeLocation.slug}`}
                className="brand-btn-muted px-4 py-2 text-sm"
              >
                Location Details
              </Link>
              <a
                href={googleListingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-btn-muted px-4 py-2 text-sm"
              >
                Google Reviews
              </a>
              <Link href={`/menu/${activeLocation.slug}/embed`} className="brand-btn px-4 py-2 text-sm">
                Start Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
