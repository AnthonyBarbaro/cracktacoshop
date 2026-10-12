import type { Metadata } from "next";

import LocationCard from "@/components/LocationCard";
import LocationsMapPanel from "@/components/LocationsMapPanel";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Locations",
  description: "Find your nearest Prime Tacos location in San Diego County.",
  alternates: {
    canonical: `${site.url}/locations`,
  },
  openGraph: {
    title: "Locations",
    description: "Find your nearest Prime Tacos location in San Diego County.",
    url: `${site.url}/locations`,
    images: ["/newlogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Locations",
    description: "Find your nearest Prime Tacos location in San Diego County.",
    images: ["/newlogo.png"],
  },
};

export default function LocationsPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="page-main">
        <section className="section-shell page-intro">
          <p className="page-kicker">Find us</p>
          <h1 className="page-title">Our locations</h1>
          <p className="page-description">Choose a location for hours, directions, and ordering.</p>
        </section>

        <section className="section-shell locations-gallery" aria-label="Our neighborhood shops">
          <div className="grid gap-x-10 gap-y-14 md:grid-cols-2">
            {locations.map((location) => (
              <LocationCard key={location.slug} location={location} />
            ))}
          </div>
        </section>

        <section className="section-shell location-map-section" aria-labelledby="location-map-title">
          <div className="location-map-heading"><p className="page-kicker">Plan your visit</p><h2 id="location-map-title" className="font-display text-4xl">Find your Prime.</h2><p>Hours may vary on holidays. Call your shop before visiting.</p></div>
          <LocationsMapPanel locations={locations} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
