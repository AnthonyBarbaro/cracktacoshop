import type { Metadata } from "next";
import Image from "next/image";
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

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the Crack Taco Shop menu and open the full ordering menu by location.",
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
    name: "Crack Taco Shop Menu",
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
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">Menu</p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Full Menu By Location, Built For Mobile Ordering
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">
              Menus can vary by location. Pick your store first so you always see the right items,
              pricing, and ordering options.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                  Pick A Store
                </p>
                <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                  Open The Right Menu Fast
                </h2>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {locations.map((location) => (
                <article
                  key={location.slug}
                  className="home-location-card group overflow-hidden rounded-2xl border border-white/10 bg-black/28 text-white"
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
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                  Featured Menu Preview
                </p>
                <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                  Top Categories And Signature Items
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Quick glance at the most-ordered sections so guests can jump straight to what they
                  want.
                </p>
              </div>
              <OpenSelectedMenuLink className="brand-btn px-4 py-2 text-sm" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredSections.map((section) => (
                <article key={section.id} className="rounded-2xl border border-white/12 bg-black/35">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <p className="font-display text-xl text-white">{section.title}</p>
                    <span className="rounded-full border border-white/15 bg-white/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-white/80">
                      Top Picks
                    </span>
                  </div>

                  <div className="space-y-4 px-4 py-4">
                    {section.groups.slice(0, 2).map((group) => (
                      <div key={`${section.id}-${group.title}`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                          {group.title}
                        </p>
                        <ul className="mt-2 space-y-2">
                          {group.items.slice(0, 3).map((item) => (
                            <li
                              key={`${section.id}-${group.title}-${item.name}`}
                              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5"
                            >
                              <p className="text-sm font-semibold text-white/92">{item.name}</p>
                              {item.description && (
                                <p className="mt-1 text-xs leading-relaxed text-white/60">{item.description}</p>
                              )}
                              {item.badge && (
                                <span className="mt-2 inline-flex rounded-full border border-[#f0be3e]/35 bg-[#f0be3e]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#f6ce69]">
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                  Food Spotlight
                </p>
                <h3 className="mt-2 font-display text-2xl text-white sm:text-3xl">
                  Real Plates From The Menu
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
