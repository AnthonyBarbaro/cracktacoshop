import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import HomeFoodShowcase from "@/components/HomeFoodShowcase";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import LocationPicker from "@/components/LocationPicker";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { foodShowcase, highlights, site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Crack Taco Shop San Diego | Tri-Tip Tacos and Burritos",
  description:
    "Order online from Crack Taco Shop San Diego. Find locations, browse menu options, and enjoy the world famous Burgundy Pepper Tri-Tip.",
  alternates: {
    canonical: site.url,
  },
  openGraph: {
    title: "Crack Taco Shop San Diego",
    description:
      "Home of the best tri-tip tacos and burritos. Order online and pick your nearest location.",
    url: site.url,
    siteName: site.shortName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${site.url}/logo.png`,
        width: 276,
        height: 105,
        alt: "Crack Taco Shop logo",
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
        image: `${site.url}/logo.png`,
        url: site.url,
        telephone: site.phone,
        servesCuisine: ["Mexican", "Tri-Tip", "Burritos", "Tacos"],
        sameAs: [site.instagram, site.facebook],
      },
      {
        "@type": "ItemList",
        "@id": `${site.url}/#locations`,
        name: "Crack Taco Shop Locations",
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
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <Script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main id="main-content" className="pb-20 pt-8 sm:pt-10">
        <section className="section-shell">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <HomeFoodShowcase slides={foodShowcase} />

            <div className="home-fade-up home-delay-1 rounded-3xl border border-[#f0be3e]/24 bg-black/45 p-5 shadow-2xl shadow-black/30 sm:p-7">
              <div className="home-fade-up home-delay-2">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-yellow">
                  Fast Ordering + Fresh Food
                </p>
                <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-white sm:text-4xl">
                  {site.heroHeadline}
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
                  {site.story}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {highlights.map((highlight, index) => (
                  <span
                    key={highlight.title}
                    className="floating-chip rounded-full border border-white/16 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white/90"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    {highlight.title}
                  </span>
                ))}
              </div>

              <div className="mt-5 hidden lg:block">
                <LocationPicker locations={locations} mode="minimal" />
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link href="/menu" className="brand-btn w-full px-4 py-2 text-sm sm:w-auto">
                  Browse Menus
                </Link>
                <Link href="/locations" className="brand-btn-muted w-full px-4 py-2 text-sm sm:w-auto">
                  View All Locations
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell mt-9">
          <div className="home-fade-up home-delay-3 rounded-3xl border border-white/10 bg-black/32 p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                  Choose A Store
                </p>
                <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                  Pick A Location And Start Fast
                </h2>
              </div>
              <p className="max-w-md text-sm text-white/70">
                Select your nearest shop to jump straight into pickup or delivery.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {locations.map((location, index) => (
                <article
                  key={location.slug}
                  className="home-location-card home-fade-up group overflow-hidden rounded-2xl border border-white/10 bg-black/28 text-white"
                  style={{ animationDelay: `${index * 85}ms` }}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={location.image}
                      alt={`${location.name} storefront`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/38 to-transparent"
                    />
                    <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                      <p className="font-display text-xl leading-tight text-white">{location.name}</p>
                      <LocationOpenBadge slug={location.slug} />
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-white/70">{location.hours}</p>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/menu/${location.slug}/embed`}
                        className="brand-btn w-full px-3 py-2 text-sm"
                      >
                        Order
                      </Link>
                      <Link
                        href={`/locations/${location.slug}`}
                        className="brand-btn-muted w-full px-3 py-2 text-sm"
                      >
                        Info
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell mt-8">
          <div className="home-fade-up home-delay-3 rounded-2xl border border-white/10 bg-black/28 px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm text-white/75">
                {site.tagline}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/order-online" className="brand-btn px-4 py-2 text-sm">
                Order Online
              </Link>
              <Link href="/menu" className="brand-btn-muted px-4 py-2 text-sm">
                View Full Menu
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
