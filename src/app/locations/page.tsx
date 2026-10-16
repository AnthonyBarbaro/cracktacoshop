import type { Metadata } from "next";
import type { ReactElement } from "react";

import LocationsMapPanel from "@/components/LocationsMapPanel";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

import styles from "./LocationsPage.module.css";

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

export default function LocationsPage(): ReactElement {
  const orderedLocations = ["seaport-village", "coronado", "encinitas", "mission-valley"]
    .flatMap((slug) => locations.filter((location) => location.slug === slug));

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="page-main">
        <section className={`section-shell ${styles.intro}`} aria-labelledby="locations-title">
          <p className="page-kicker">Plan your visit</p>
          <h1 id="locations-title" className={styles.title}>Find your Prime.</h1>
          <p className={styles.description}>Hours may vary on holidays. Call your shop before visiting.</p>
        </section>

        <section className="section-shell" aria-label="Our locations">
          <LocationsMapPanel locations={orderedLocations} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
