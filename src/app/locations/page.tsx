import type { Metadata } from "next";

import LocationCard from "@/components/LocationCard";
import LocationsMapPanel from "@/components/LocationsMapPanel";
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
          <LocationsMapPanel locations={locations} />
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
