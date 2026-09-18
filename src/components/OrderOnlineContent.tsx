"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { locations } from "@/data/locations";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { useShoppingLocation } from "@/lib/use-shopping-location";

export default function OrderOnlineContent(): ReactElement {
  const selectedLocation = useShoppingLocation();
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
          {selectedLocation && (
            <Link href="/locations" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-brand-green hover:underline">
              All locations
            </Link>
          )}
        </div>
      </section>

      <section className="section-shell mt-10">
        <div className={`grid gap-4 ${selectedLocation ? "max-w-2xl" : "md:grid-cols-2 xl:grid-cols-4"}`}>
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
                <p className="font-display text-2xl text-neutral-950">{location.name}</p>
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
                  {location.doorDash && (
                    <a
                      href={location.doorDash}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn-muted w-full px-3 py-2 text-sm sm:w-auto"
                    >
                      DoorDash
                    </a>
                  )}
                  {location.grubHub && (
                    <a
                      href={location.grubHub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn-muted w-full px-3 py-2 text-sm sm:w-auto"
                    >
                      GrubHub
                    </a>
                  )}
                  {location.uberEats && (
                    <a
                      href={location.uberEats}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn-muted w-full px-3 py-2 text-sm sm:w-auto"
                    >
                      Uber Eats
                    </a>
                  )}
                </div>

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
