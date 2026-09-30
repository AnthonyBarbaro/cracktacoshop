"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";

import DeliveryLinks from "@/components/DeliveryLinks";

import { locations } from "@/data/locations";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { setStoredShoppingLocationSlug } from "@/lib/shopping-location";
import { useShoppingLocation } from "@/lib/use-shopping-location";

export default function OrderOnlineContent(): ReactElement {
  const shoppingLocation = useShoppingLocation();
  const [showAllLocations, setShowAllLocations] = useState(false);
  const selectedLocation = showAllLocations ? undefined : shoppingLocation;
  const displayedLocations = selectedLocation ? [selectedLocation] : locations;

  return (
    <main id="main-content" className="pb-20 pt-10 sm:pt-12">
      <section className="section-shell">
        <div className="py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
            Order Online
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-3xl text-neutral-950 sm:text-4xl lg:text-5xl">
            {selectedLocation ? `Order from ${selectedLocation.name}` : "Order online"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-neutral-600 sm:text-base">
            {selectedLocation
              ? `Choose an available ordering option for ${selectedLocation.name}.`
              : "Select a location below and choose your preferred ordering provider."}
          </p>
          <div className="mt-6 max-w-sm">
            <label htmlFor="order-location" className="block text-sm font-semibold text-neutral-950">
              Your location
            </label>
            <select
              id="order-location"
              value={selectedLocation?.slug ?? ""}
              onChange={(event) => {
                const slug = event.target.value;
                setShowAllLocations(!slug);
                if (slug) setStoredShoppingLocationSlug(slug);
              }}
              className="mt-2 min-h-12 w-full rounded border border-neutral-300 bg-white px-3 text-base text-neutral-950"
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.slug} value={location.slug}>{location.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10">
        <div className={`grid gap-4 ${selectedLocation ? "max-w-2xl" : "md:grid-cols-2"}`}>
          {displayedLocations.map((location) => {
            const directionsUrl = getGoogleMapsDirectionsUrl({
              address: location.address,
              placeId: location.placeId,
              googleMapsUrl: location.googleMapsUrl,
            });

            return (
              <article
                key={location.slug}
                className="rounded-lg border border-neutral-200 bg-white p-5 text-neutral-950"
              >
                <h2 className="font-display text-2xl text-neutral-950">{location.name}</h2>
                <p className="mt-2 text-sm text-neutral-600">{location.address}</p>
                <p className="mt-2 text-xs text-neutral-600">{location.hours}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-btn-directions w-full px-3 py-2 text-sm sm:w-auto"
                  >
                    Get Directions
                  </a>
                  {location.toastUrl && (
                    <a
                      href={location.toastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn w-full px-3 py-2 text-sm sm:w-auto"
                    >
                      Toast Pickup
                    </a>
                  )}
                </div>

                <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">Delivery</h3>
                <DeliveryLinks location={location} className="mt-3 grid gap-2 sm:grid-cols-2" />
                <p className="mt-3 text-xs text-neutral-600">Availability and fees depend on your delivery address.</p>

                <Link
                  href={`/locations/${location.slug}`}
                  className="brand-btn-muted mt-4 inline-flex w-full px-3 py-2 text-sm sm:w-auto"
                >
                  Location details
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
