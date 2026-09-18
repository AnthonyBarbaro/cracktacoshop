"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import MainPhoneCard from "@/components/MainPhoneCard";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { useShoppingLocation } from "@/lib/use-shopping-location";

export default function ContactContent(): ReactElement {
  const selectedLocation = useShoppingLocation();
  const displayedLocations = selectedLocation ? [selectedLocation] : locations;

  return (
    <main id="main-content" className="pb-20 pt-10 sm:pt-12">
      <section className="section-shell">
        <div className="py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
            Contact
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl text-neutral-950 sm:text-4xl lg:text-5xl">
            {selectedLocation ? `Contact ${selectedLocation.name}` : "Get in touch"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
            {selectedLocation
              ? `Call our ${selectedLocation.name} shop for immediate orders.`
              : "For immediate orders, call your nearest location."}{" "}
            You can also connect with us on social channels for updates and announcements.
          </p>
          {selectedLocation && (
            <Link href="/locations" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-brand-green hover:underline">
              All locations
            </Link>
          )}
        </div>
      </section>

      <section className="section-shell mt-10">
        <div className="grid gap-4 md:grid-cols-3">
          <MainPhoneCard />

          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-200 bg-white p-5"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-brand-green">Instagram</p>
            <p className="mt-2 text-sm font-semibold text-neutral-950">Follow on Instagram</p>
          </a>

          <a
            href={site.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-200 bg-white p-5"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-brand-green">Facebook</p>
            <p className="mt-2 text-sm font-semibold text-neutral-950">Visit our Facebook</p>
          </a>
        </div>
      </section>

      <section className="section-shell mt-10">
        <div className="border-t border-neutral-200 pt-8">
          <h2 className="font-display text-3xl text-neutral-950 sm:text-4xl">
            {selectedLocation ? `Visit ${selectedLocation.name}` : "Call your local shop"}
          </h2>
          <div className={`mt-5 grid gap-3 ${selectedLocation ? "max-w-2xl" : "md:grid-cols-2 xl:grid-cols-4"}`}>
            {displayedLocations.map((location) => {
              const directionsUrl = getGoogleMapsDirectionsUrl({
                address: location.address,
                placeId: location.placeId,
                googleMapsUrl: location.googleMapsUrl,
              });

              return (
                <article
                  key={location.slug}
                  className="rounded-lg border border-neutral-200 bg-white p-4 text-sm"
                >
                  <p className="font-semibold text-neutral-950">{location.name}</p>
                  <p className="mt-1 text-neutral-600">{location.address}</p>
                  <p className="mt-2 text-neutral-600">{location.hours}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {location.phone && (
                      <a
                        href={`tel:${location.phone}`}
                        className="inline-flex w-full font-semibold text-brand-green sm:w-auto"
                      >
                        {location.phone}
                      </a>
                    )}
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn-directions w-full px-3 py-2 text-sm sm:w-auto"
                    >
                      Get Directions
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
