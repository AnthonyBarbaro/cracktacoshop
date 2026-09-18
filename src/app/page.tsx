import type { Metadata } from "next";
import Script from "next/script";

import HomeContent from "@/components/HomeContent";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

export const metadata: Metadata = {
  title: { absolute: "Prime Tacos | Tri-Tip Tacos & Burritos in San Diego" },
  description:
    "Order online from Prime Tacos San Diego. Find locations, browse menu options, and enjoy the world famous Burgundy Pepper Tri-Tip.",
  alternates: {
    canonical: site.url,
  },
  openGraph: {
    title: "Prime Tacos San Diego",
    description:
      "Home of the best tri-tip tacos and burritos. Order online and pick your nearest location.",
    url: site.url,
    siteName: site.shortName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${site.url}/newlogo.png`,
        width: 3822,
        height: 2378,
        alt: "Prime Tacos logo",
      },
    ],
  },
};

export default function HomePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "@id": `${site.url}/#restaurant`,
        name: site.shortName,
        image: `${site.url}/newlogo.png`,
        url: site.url,
        telephone: site.phone,
        servesCuisine: ["Mexican", "Tri-Tip", "Burritos", "Tacos"],
        sameAs: [site.instagram, site.facebook],
      },
      {
        "@type": "ItemList",
        "@id": `${site.url}/#locations`,
        name: "Prime Tacos Locations",
        itemListElement: locations.map((location, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${site.url}/locations/${location.slug}`,
          name: location.name,
        })),
      },
      ...locations.map((location) => ({
        "@type": "Restaurant",
        "@id": `${site.url}/locations/${location.slug}#restaurant`,
        name: `${site.shortName} ${location.name}`,
        image: `${site.url}${location.image}`,
        url: `${site.url}/locations/${location.slug}`,
        telephone: location.phone,
        openingHours: location.hours,
        address: {
          "@type": "PostalAddress",
          streetAddress: location.address.split(",")[0],
          addressLocality: location.city,
          addressRegion: location.state,
          postalCode: location.postalCode,
          addressCountry: "US",
        },
      })),
    ],
  };

  return (
    <>
      <SiteHeader />
      <Script id="homepage-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <HomeContent />
      <SiteFooter />
    </>
  );
}
