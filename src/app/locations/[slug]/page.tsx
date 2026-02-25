import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import {
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  getGoogleMapsSearchUrl,
} from "@/lib/google-maps";

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
      title: "Location Not Found | Crack Taco Shop",
    };
  }

  const url = `${site.url}/locations/${location.slug}`;

  return {
    title: `${location.name} | Crack Taco Shop San Diego`,
    description: `${location.name} location details, hours, phone number, online ordering, and menu.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${location.name} | Crack Taco Shop`,
      description: `${location.address}. ${location.hours}.`,
      url,
      siteName: site.shortName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${site.url}${location.image}`,
          width: 1600,
          height: 1000,
          alt: `${location.name} location`,
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
  const schemaUrl = `${site.url}/locations/${location.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${schemaUrl}#restaurant`,
    name: `${site.shortName} ${location.name}`,
    image: `${site.url}${location.image}`,
    servesCuisine: ["Mexican", "Tri-Tip Tacos", "Burritos"],
    url: schemaUrl,
    telephone: location.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address.split(",")[0],
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.postalCode,
      addressCountry: "US",
    },
    openingHours: location.hours,
    menu: pickupOrderUrl ?? `${site.url}${menuEmbedUrl}`,
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
      <SiteHeader ctaHref="#menu" ctaLabel="Order Online" />
      <Script
        id={`restaurant-schema-${location.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main id="main-content" className="pb-20 pt-10 text-white sm:pt-12">
        <div className="section-shell space-y-8">
          <section className="overflow-hidden rounded-3xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm sm:p-8">
            <Link href="/" className="text-sm font-semibold text-brand-yellow hover:text-white">
              ← Back to locations
            </Link>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div className="relative h-60 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-[28rem]">
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                  Crack Taco Shop
                </p>
                <h1 className="font-display text-3xl text-white sm:text-4xl lg:text-5xl">{location.name}</h1>
                <p className="text-white/85">{location.address}</p>
                <p className="text-white/75">{location.hours}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-btn-directions w-full px-4 py-2 text-sm sm:w-auto"
                  >
                    Get Directions
                  </a>
                  {pickupOrderUrl && (
                    <a
                      href={pickupOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn w-full px-4 py-2 text-sm sm:w-auto"
                    >
                      Pickup Order (Toast)
                    </a>
                  )}
                  {location.phone && (
                    <a href={`tel:${location.phone}`} className="brand-btn w-full px-4 py-2 text-sm sm:w-auto">
                      Call {location.phone}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {location.doorDash && (
                    <a
                      href={location.doorDash}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn-muted w-full px-4 py-2 text-sm sm:w-auto"
                    >
                      DoorDash
                    </a>
                  )}
                  {location.grubHub && (
                    <a
                      href={location.grubHub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn-muted w-full px-4 py-2 text-sm sm:w-auto"
                    >
                      GrubHub
                    </a>
                  )}
                  {location.uberEats && (
                    <a
                      href={location.uberEats}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-btn-muted w-full px-4 py-2 text-sm sm:w-auto"
                    >
                      Uber Eats
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/12 bg-black/35">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                  Map + Directions
                </p>
                <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
                  {location.name}
                </h2>
              </div>
              <LocationOpenBadge slug={location.slug} />
            </div>

            <div className="relative min-h-72">
              <iframe
                title={`${location.name} location map`}
                src={mapEmbedUrl}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="border-t border-white/10 px-5 py-4 sm:px-6">
              <p className="text-sm text-white/75">{location.address}</p>
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                Full Menu
              </p>
              <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                Browse by Category and Order Fast
              </h2>
              <p className="mt-2 text-sm text-white/75 sm:text-base">
                Open the complete location menu page with full navigation, footer, and ordering
                links.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={menuEmbedUrl} className="brand-btn w-full px-4 py-3 text-sm sm:w-auto">
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
