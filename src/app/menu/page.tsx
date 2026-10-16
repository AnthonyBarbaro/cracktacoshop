import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteIcon from "@/components/SiteIcon";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import { getMenuHref } from "@/lib/menu-link";

import styles from "./MenuPage.module.css";

export const metadata: Metadata = {
  title: "Menu",
  description: "Choose your Prime Tacos location to see its menu and prices.",
  alternates: {
    canonical: `${site.url}/menu`,
  },
  openGraph: {
    title: "Menu",
    description: "Choose your Prime Tacos location to see its menu and prices.",
    url: `${site.url}/menu`,
    images: ["/newlogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu",
    description: "Choose your Prime Tacos location to see its menu and prices.",
    images: ["/newlogo.png"],
  },
};

export default function MenuPage(): ReactElement {
  const menuLocations = ["seaport-village", "coronado", "encinitas", "mission-valley"]
    .flatMap((slug) => locations.filter((location) => location.slug === slug));

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className={`page-main ${styles.main}`}>
        <section className={`section-shell ${styles.section}`} aria-labelledby="menu-title">
          <h1 id="menu-title" className={styles.title}>Menu</h1>
          <p className={styles.description}>Choose a location.</p>
          <nav aria-label="Choose a location menu" className={styles.locations}>
            {menuLocations.map((location) => (
              <Link key={location.slug} href={getMenuHref(location)} className={styles.location}>
                {location.name.toUpperCase()}
                <SiteIcon name="arrow" className={styles.arrow} />
              </Link>
            ))}
          </nav>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
