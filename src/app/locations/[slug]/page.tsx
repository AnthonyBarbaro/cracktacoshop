import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

import DeliveryButton from "@/components/DeliveryButton";
import SiteIcon from "@/components/SiteIcon";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import GoogleMapEmbed from "@/components/GoogleMapEmbed";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { getLocationFoodPhoto, site } from "@/data/site-content";
import {
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  getGoogleMapsSearchUrl,
} from "@/lib/google-maps";
import { getMenuHref } from "@/lib/menu-link";
import { getLocationOpeningHoursSpecification } from "@/lib/location-hours";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = locations.find((entry) => entry.slug === slug);

  if (!location) {
    return {
      title: "Location Not Found",
    };
  }

  const url = `${site.url}/locations/${location.slug}`;

  return {
    title: location.name,
    description: `${location.name} location details, hours, phone number, online ordering, and menu.`,
    alternates: {
      canonical: url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${location.name} | Prime Tacos`,
      description: `${location.address}. ${location.hours}.`,
      images: [`${site.url}/newlogo.png`],
    },
    openGraph: {
      title: `${location.name} | Prime Tacos`,
      description: `${location.address}. ${location.hours}.`,
      url,
      siteName: site.shortName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${site.url}/newlogo.png`,
          width: 3822,
          height: 2378,
          alt: "Prime Tacos",
        },
      ],
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = locations.find((l) => l.slug === slug);

  if (!location) {
    return notFound();
  }

  const menuEmbedUrl = location.menuUrl ?? `/menu/${location.slug}/embed`;
  const directionsUrl = getGoogleMapsSearchUrl({
    address: location.address,
    placeId: location.placeId,
    googleMapsUrl: location.googleMapsUrl,
  });
  const mapsDirectionsUrl = getGoogleMapsDirectionsUrl({
    address: location.address,
    placeId: location.placeId,
    googleMapsUrl: location.googleMapsUrl,
  });
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const mapEmbedUrl = getGoogleMapsEmbedUrl({
    address: location.address,
    placeId: location.placeId,
    apiKey: googleMapsApiKey,
  });
  const pickupOrderUrl = location.toastUrl;
  const photo = getLocationFoodPhoto(location.slug);
  const schemaUrl = `${site.url}/locations/${location.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${schemaUrl}#restaurant`,
    name: `${site.shortName} ${location.name}`,
    image: `${site.url}/newlogo.png`,
    servesCuisine: ["Mexican", "Tri-Tip Tacos", "Burritos"],
    url: schemaUrl,
    telephone: location.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address.split(location.city)[0].replace(/[,\s]+$/, ""),
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.postalCode,
      addressCountry: "US",
    },
    openingHoursSpecification: getLocationOpeningHoursSpecification(location.slug),
    menu: new URL(menuEmbedUrl, site.url).href,
    potentialAction: pickupOrderUrl
      ? {
          "@type": "OrderAction",
          target: pickupOrderUrl,
        }
      : undefined,
    sameAs: [site.instagram, site.facebook].filter(Boolean),
  };

  return (
    <>
      <SiteHeader ctaHref={pickupOrderUrl ?? "/order-online"} ctaLabel="Order pickup" />
      <Script
        id={`restaurant-schema-${location.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main id="main-content" className="page-main location-detail-page">
        <div className="section-shell space-y-8">
          <section>
            <Link href="/locations" className="text-sm font-semibold text-brand-green hover:text-brand-green">
              ← Back to locations
            </Link>

            <div className="location-detail-intro">
              <div className="page-intro">
                <p className="page-kicker">
                  Prime Tacos
                </p>
                <h1 className="page-title">{location.name}</h1>
                <p className="text-neutral-600">{location.address}</p>
                <p className="text-neutral-600">{location.hours}</p>
                <p className="location-holiday-note">Hours may vary on holidays. Call the shop before visiting.</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-btn-muted w-full px-4 py-3 text-sm sm:w-auto"
                  >
                    Get Directions
                  </a>
                  {pickupOrderUrl && (
                    <a
                      href={pickupOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn w-full px-4 py-3 text-sm sm:w-auto"
                    >
                      Order pickup
                    </a>
                  )}
                  {location.phone && (
                    <a href={`tel:${location.phone}`} className="text-link w-full py-2 sm:w-auto">
                      Call {location.phone}
                    </a>
                  )}
                </div>

                <DeliveryButton locationSlug={location.slug} className="text-link">Order delivery<SiteIcon name="delivery" /></DeliveryButton>
              </div>
              <div className="location-detail-photo"><Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" priority /><span className="location-photo-label">From our kitchen</span></div>
            </div>
          </section>

          <section className="surface-panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 sm:px-6">
              <div>
                <p className="page-kicker">
                  Map + Directions
                </p>
                <h2 className="mt-1 font-display text-2xl text-brand-green sm:text-3xl">
                  {location.name}
                </h2>
              </div>
              <LocationOpenBadge slug={location.slug} />
            </div>

            <div className="relative min-h-72">
              <GoogleMapEmbed
                title={`${location.name} location map`}
                src={mapEmbedUrl}
                allowFullScreen
              />
            </div>

            <div className="border-t border-neutral-200 px-5 py-4 sm:px-6">
              <p className="text-sm text-neutral-600">{location.address}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-btn-directions px-4 py-2 text-sm"
                >
                  Get Directions
                </a>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-btn-muted px-4 py-2 text-sm"
                >
                  Open In Google Maps
                </a>
              </div>
            </div>
          </section>

          <section id="menu" className="space-y-4">
            <div>
              <p className="page-kicker">
                Full Menu
              </p>
              <h2 className="mt-2 font-display text-3xl text-brand-green sm:text-4xl">
                Our menu
              </h2>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                Explore the {location.name} menu and choose your favorites.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={getMenuHref(location)} className="brand-btn w-full px-4 py-3 text-sm sm:w-auto">
                Open Full Menu
              </Link>
              <Link
                href="/menu"
                className="brand-btn-muted w-full px-4 py-3 text-sm sm:w-auto"
              >
                View All Location Menus
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
