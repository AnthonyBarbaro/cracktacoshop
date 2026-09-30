import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import HomeFoodShowcase from "@/components/HomeFoodShowcase";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import OpenSelectedMenuLink from "@/components/OpenSelectedMenuLink";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getFlattenedMenuItems, getMenuForLocation } from "@/data/menu";
import { locations } from "@/data/locations";
import { foodShowcase, site } from "@/data/site-content";
import { getMenuHref } from "@/lib/menu-link";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the Prime Tacos menu and open the full ordering menu by location.",
  alternates: {
    canonical: `${site.url}/menu`,
  },
};

export default function MenuPage() {
  const featuredMenu = getMenuForLocation("mission-valley");
  const featuredSections = featuredMenu.sections.slice(0, 3);

  const menuSchema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Prime Tacos Menu",
    hasMenuSection: featuredMenu.sections.map((section) => ({
      "@type": "MenuSection",
      name: section.title,
      hasMenuItem: getFlattenedMenuItems([section]).map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description,
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: item.price.replace("$", ""),
        },
      })),
    })),
  };

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <Script
        id="menu-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">Menu</p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-neutral-950 sm:text-4xl lg:text-5xl">
              Our menu
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-neutral-600 sm:text-base">
              Choose your location to see the menu and order.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-neutral-950 sm:text-3xl">
                  Choose a location
                </h2>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {locations.map((location) => (
                <article
                  key={location.slug}
                  className="home-location-card group overflow-hidden rounded-lg border border-neutral-200 bg-white text-neutral-950"
                >
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-xl leading-tight text-neutral-950">{location.name}</h3>
                      <LocationOpenBadge slug={location.slug} />
                    </div>
                    <p className="mt-3 text-sm text-neutral-600">{location.address}</p>
                    <p className="mt-2 text-xs text-neutral-600">{location.hours}</p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={getMenuHref(location)}
                        className="brand-btn w-full px-3 py-2 text-sm"
                      >
                        Open Menu
                      </Link>
                      <Link
                        href={`/locations/${location.slug}`}
                        className="brand-btn-muted w-full px-3 py-2 text-sm"
                      >
                        Location
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="border-t border-neutral-200 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
                  Favorites
                </p>
                <h2 className="mt-2 font-display text-3xl text-neutral-950 sm:text-4xl">
                  A taste of Prime Tacos
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                  Tacos, burritos, and more from our Mission Valley menu.
                </p>
              </div>
              <OpenSelectedMenuLink className="brand-btn px-4 py-2 text-sm" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredSections.map((section) => (
                <article key={section.id} className="rounded-lg border border-neutral-200 bg-white">
                  <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
                    <p className="font-display text-xl text-neutral-950">{section.title}</p>
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-neutral-600">
                      Top Picks
                    </span>
                  </div>

                  <div className="space-y-4 px-4 py-4">
                    {section.groups.slice(0, 2).map((group) => (
                      <div key={`${section.id}-${group.title}`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
                          {group.title}
                        </p>
                        <ul className="mt-2 space-y-2">
                          {group.items.slice(0, 3).map((item) => (
                            <li
                              key={`${section.id}-${group.title}-${item.name}`}
                              className="border-b border-neutral-100 py-2.5 last:border-0"
                            >
                              <p className="text-sm font-semibold text-neutral-950">{item.name}</p>
                              {item.description && (
                                <p className="mt-1 text-xs leading-relaxed text-neutral-600">{item.description}</p>
                              )}
                              {item.badge && (
                                <span className="mt-2 inline-flex rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-green">
                                  {item.badge}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
                  Food Spotlight
                </p>
                <h3 className="mt-2 font-display text-2xl text-neutral-950 sm:text-3xl">
                  Made to order
                </h3>
              </div>
              <HomeFoodShowcase slides={foodShowcase} variant="tall" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
