import type { Metadata } from "next";
import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Order Online",
  description: "Order online from Crack Taco Shop locations using pickup and delivery options.",
  alternates: {
    canonical: `${site.url}/order-online`,
  },
};

export default function OrderOnlinePage() {
  return (
    <>
      <SiteHeader ctaHref="/locations" ctaLabel="View Locations" />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
              Order Online
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Pickup and Delivery, Built For Fast Ordering
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">
              Select a location below and choose your preferred ordering provider.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {locations.map((location) => {
              const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;

              return (
                <article
                  key={location.slug}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white"
                >
                  <p className="font-display text-2xl text-white">{location.name}</p>
                  <p className="mt-2 text-sm text-white/70">{location.address}</p>
                  <p className="mt-2 text-xs text-white/65">{location.hours}</p>

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
                    Full Location Page
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
