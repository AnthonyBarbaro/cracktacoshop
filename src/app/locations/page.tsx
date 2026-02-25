import type { Metadata } from "next";

import LocationCard from "@/components/LocationCard";
import LocationPicker from "@/components/LocationPicker";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Locations",
  description: "Find your nearest Crack Taco Shop location in San Diego County.",
  alternates: {
    canonical: `${site.url}/locations`,
  },
};

export default function LocationsPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-yellow">
              Our Locations
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Choose Your Location
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
              Pick a store to order online, call, or get directions in one tap.
            </p>
            <div className="mt-6 max-w-3xl">
              <LocationPicker locations={locations} />
            </div>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {locations.map((location) => (
              <LocationCard key={location.slug} location={location} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
