import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import LocationOpenBadge from "@/components/LocationOpenBadge";
import LocationPicker from "@/components/LocationPicker";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { reviews, site } from "@/data/site-content";

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
  const renderStars = () => (
    <div className="review-stars" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, starIndex) => (
        <svg key={starIndex} viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="m10 1.7 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L10 1.7Z" />
        </svg>
      ))}
    </div>
  );

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

      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="rounded-3xl border border-[#f0be3e]/24 bg-black/45 p-6 shadow-2xl shadow-black/35 sm:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-yellow">
                  Fastest Way To Order
                </p>
                <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                  Select Your Store and Start Ordering in Under a Minute
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
                  Choose your location first. Then jump directly into the right menu with current
                  pickup and delivery options.
                </p>

                <div className="mt-5 grid gap-2 text-sm text-white/80 sm:grid-cols-3">
                  <p className="rounded-xl border border-white/10 bg-black/35 px-3 py-2">Open Late 7 Days</p>
                  <p className="rounded-xl border border-white/10 bg-black/35 px-3 py-2">Pickup + Delivery</p>
                  <p className="rounded-xl border border-white/10 bg-black/35 px-3 py-2">Cardiff Crack Tri-Tip</p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link href="/menu" className="brand-btn w-full px-4 py-2 text-sm sm:w-auto">
                    Browse Menus
                  </Link>
                  <Link href="/locations" className="brand-btn-muted w-full px-4 py-2 text-sm sm:w-auto">
                    View All Locations
                  </Link>
                </div>
              </div>

              <LocationPicker locations={locations} />
            </div>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                Choose A Store
              </p>
              <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                Start With Your Nearest Location
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/70">
              Every location has its own menu page, hours, and ordering links.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {locations.map((location) => (
              <article
                key={location.slug}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-2xl text-white">{location.name}</p>
                  <LocationOpenBadge slug={location.slug} />
                </div>
                <p className="mt-2 text-xs text-white/70">{location.hours}</p>
                <p className="mt-3 text-sm text-white/80">{location.address}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/menu/${location.slug}/embed`}
                    className="brand-btn w-full px-3 py-2 text-sm sm:w-auto"
                  >
                    Start Order
                  </Link>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="brand-btn-muted w-full px-3 py-2 text-sm sm:w-auto"
                  >
                    Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                  Social Proof
                </p>
                <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                  5-Star Reviews From Real Guests
                </h2>
              </div>
              <div className="inline-flex items-center gap-3 rounded-xl border border-white/12 bg-black/35 px-3 py-2">
                {renderStars()}
                <p className="text-sm font-semibold text-white">Rated 5.0 by local customers</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reviews.slice(0, 6).map((review, index) => (
                <article
                  key={`${review.author}-${index}`}
                  className="review-card review-card-animate rounded-2xl border border-white/10 bg-black/35 p-5"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <p className="font-semibold text-white">{review.author}</p>
                  <p className="mt-1 text-xs text-white/65">{review.reviewerStats}</p>
                  {renderStars()}
                  <p className="mt-2 text-xs text-brand-yellow">
                    Visited: {review.locationVisited} · {review.timeAgo}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/85">“{review.quote}”</p>
                </article>
              ))}
            </div>

            <div className="mt-5">
              <Link href="/reviews" className="brand-btn-muted px-4 py-2 text-sm">
                Read More Reviews
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
