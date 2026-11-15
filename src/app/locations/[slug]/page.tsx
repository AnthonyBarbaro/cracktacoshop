import type { ReactElement } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import DeliveryButton from "@/components/DeliveryButton";
import SiteIcon from "@/components/SiteIcon";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import GoogleMapEmbed from "@/components/GoogleMapEmbed";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { getLocationFoodPhoto, site } from "@/data/site-content";
import { socialImage } from "@/data/social-image";
import {
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  getGoogleMapsSearchUrl,
} from "@/lib/google-maps";
import { getMenuHref } from "@/lib/menu-link";
import { getLocationRestaurantSchema } from "@/lib/location-schema";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = locations.find((entry) => entry.slug === slug);

  if (!location) {
    notFound();
  }

  const url = `${site.url}/locations/${location.slug}`;

  return {
    title: { absolute: location.seoTitle },
    description: location.description,
    alternates: {
      canonical: url,
    },
    twitter: {
      card: "summary_large_image",
      title: location.seoTitle,
      description: location.description,
      images: [socialImage],
    },
    openGraph: {
      title: location.seoTitle,
      description: location.description,
      url,
      siteName: site.shortName,
      locale: "en_US",
      type: "website",
      images: [socialImage],
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const location = locations.find((l) => l.slug === slug);

  if (!location) {
    return notFound();
  }

  const menuUrl = getMenuHref(location);
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
  const schema = getLocationRestaurantSchema(location);

  return (
    <>
      <SiteHeader />
      {schema && <script
        id={`restaurant-schema-${location.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\u003c") }}
      />}

      <main id="main-content" className="page-main location-detail-page">
        <div className="section-shell space-y-8">
          <section>
            <Link href="/locations" className="text-sm font-semibold text-brand-green hover:text-brand-green">
              ← Back to locations
            </Link>

            <div className="location-detail-intro">
              <div className="page-intro">
                <p className="page-kicker">
                  Prime Taco Shop
                </p>
                <h1 className="page-title">{location.name}</h1>
                <p className="page-description">{location.introduction}</p>
                <p className="text-neutral-600">{location.address}</p>
                <p className="text-neutral-600">{location.hours}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <a href="#menu" className="brand-btn-muted w-full px-4 py-3 text-sm sm:w-auto">View menu</a>
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
                On the {location.name} menu:
              </p>
            </div>

            <ul className="list-disc space-y-2 pl-5 text-neutral-600">
              {location.menuHighlights.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="text-sm text-neutral-600">Check Toast for current prices, menu availability and pickup times.</p>
            <div className="flex flex-wrap gap-2">
              <Link href={menuUrl} className="brand-btn w-full px-4 py-3 text-sm sm:w-auto">
                Open Full Menu
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
