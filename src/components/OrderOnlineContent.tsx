"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type ReactElement } from "react";

import DeliveryLinks from "@/components/DeliveryLinks";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteIcon from "@/components/SiteIcon";

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
    <main id="main-content" className="page-main">
      <section className="section-shell page-intro order-intro">
        <div>
          <p className="page-kicker">
            Order Online
          </p>
          <h1 className="page-title">
            {selectedLocation ? `Order from ${selectedLocation.name}` : "Order online"}
          </h1>
          <p className="page-description">
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
              className="brand-input mt-2 px-3 text-base"
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.slug} value={location.slug}>{location.name}</option>
              ))}
            </select>
          </div>
        </div>
        <figure className="order-intro-photo"><Image src="/images/legacy/breakfast-burrito.jpg" alt="Breakfast burrito halves filled with eggs and meat" fill sizes="(min-width: 800px) 40vw, 100vw" priority /></figure>
      </section>

      <section className="section-shell order-options-section">
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
                className="surface-panel order-shop-panel"
              >
                <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-3xl">{location.name}</h2><LocationOpenBadge slug={location.slug} /></div>
                <p className="mt-2 text-sm text-neutral-600">{location.address}</p>
                <p className="mt-2 text-xs text-neutral-600">{location.hours}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-btn-muted w-full px-4 py-3 text-sm sm:w-auto"
                  >
                    Get Directions
                  </a>
                  {location.toastUrl && (
                    <a
                      href={location.toastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn w-full px-4 py-3 text-sm sm:w-auto"
                    >
                      Order pickup<SiteIcon name="bag" />
                    </a>
                  )}
                </div>

                <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">Delivery</h3>
                <DeliveryLinks location={location} variant="rows" className="mt-3" />
                <p className="mt-3 text-xs text-neutral-600">Availability and fees depend on your delivery address.</p>

                <Link
                  href={`/locations/${location.slug}`}
                  className="text-link mt-4"
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
