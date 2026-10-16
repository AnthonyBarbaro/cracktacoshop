import type { Metadata } from "next";
import type { ReactElement } from "react";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Catering",
  description: "Contact your Prime Tacos location about catering.",
  alternates: { canonical: `${site.url}/catering` },
};

export default function CateringPage(): ReactElement {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-main">
        <section className="section-shell page-intro">
          <h1 className="page-title">Catering.</h1>
          <p className="page-description">Call your location to plan your order.</p>
          <ul className="catering-locations">
            {locations.filter((location) => location.phone).map((location) => (
              <li key={location.slug}>
                <h2>{location.name}</h2>
                <a href={`tel:${location.phone}`} aria-label={`Call ${location.name} about catering`}>{location.phone}</a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
