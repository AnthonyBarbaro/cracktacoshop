import type { Metadata } from "next";
import type { ReactElement } from "react";

import LocationsMapPanel from "@/components/LocationsMapPanel";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import { socialImage } from "@/data/social-image";

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
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Locations",
    description: "Find your nearest Prime Tacos location in San Diego County.",
    images: [socialImage],
  },
};

export default function LocationsPage(): ReactElement {
  const orderedLocations = ["seaport-village", "coronado", "encinitas", "mission-valley"]
    .flatMap((slug) => locations.filter((location) => location.slug === slug));

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className={`page-main ${styles.page}`}>
        <section className={styles.intro} aria-labelledby="locations-title">
          <p className="page-kicker">Plan your visit</p>
          <h1 id="locations-title" className={styles.title}>Find your Prime.</h1>
        </section>

        <section className={styles.mapSection} aria-label="Our locations">
          <LocationsMapPanel locations={orderedLocations} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
