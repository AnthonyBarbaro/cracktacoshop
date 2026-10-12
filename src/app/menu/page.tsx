import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import LocationOpenBadge from "@/components/LocationOpenBadge";
import OpenSelectedMenuLink from "@/components/OpenSelectedMenuLink";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getFlattenedMenuItems, getMenuForLocation } from "@/data/menu";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import { getMenuHref } from "@/lib/menu-link";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the Prime Tacos menu and open the full ordering menu by location.",
  alternates: {
    canonical: `${site.url}/menu`,
  },
  openGraph: {
    title: "Menu",
    description: "Browse the Prime Tacos menu and open the full ordering menu by location.",
    url: `${site.url}/menu`,
    images: ["/newlogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu",
    description: "Browse the Prime Tacos menu and open the full ordering menu by location.",
    images: ["/newlogo.png"],
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
      <main id="main-content" className="page-main">
        <section className="section-shell page-intro menu-overview-hero">
          <div>
            <p className="page-kicker">Menu</p>
            <h1 className="page-title">
              Explore <em>the menu.</em>
            </h1>
            <p className="page-description">
              Signature tri-tip, handmade tortillas, and fresh salsa. Choose your shop to explore its menu.
            </p>
          </div>
          <figure className="menu-overview-photo"><Image src="/images/beef-quesadilla.jpg" alt="Quesadilla wedges served with guacamole and crema" fill sizes="(min-width: 800px) 45vw, 100vw" priority /></figure>
        </section>

        <section className="section-shell menu-location-section">
          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="page-kicker">Four shops, one Prime</p>
                <h2 className="mt-3 font-display text-4xl text-[#173d2c] sm:text-5xl">
                  Choose your neighborhood.
                </h2>
              </div>
            </div>

            <div className="grid gap-x-10 gap-y-3 md:grid-cols-2">
              {locations.map((location) => (
                <article
                  key={location.slug}
                  className="menu-location-card surface-panel"
                >
                  <div className="flex h-full flex-col p-5">
                    <div className="flex flex-col items-start gap-3">
                      <h3 className="font-display text-2xl leading-tight">{location.name}</h3>
                      <LocationOpenBadge slug={location.slug} />
                    </div>
                    <p className="mt-3 text-sm text-neutral-600">{location.address}</p>
                    <p className="mt-2 text-xs text-neutral-600">{location.hours}</p>
                    <div className="mt-auto flex gap-2 pt-5">
                      <Link
                        href={getMenuHref(location)}
                        className="brand-btn w-full px-3 py-2 text-sm"
                      >
                        View menu
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
                <p className="page-kicker">
                  Favorites
                </p>
                <h2 className="mt-2 font-display text-3xl text-[#173d2c] sm:text-4xl">
                  A taste of Prime Tacos
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                  Tacos, burritos, and more from our Mission Valley menu.
                </p>
              </div>
              <OpenSelectedMenuLink className="brand-btn px-4 py-3 text-sm" label="Choose your menu" />
            </div>

            <div className="menu-photo-strip" aria-label="A look at the menu">
              {[
                { src: "/images/al-pastor-street-tacos.jpg", alt: "Al pastor street tacos" },
                { src: "/images/legacy/breakfast-burrito.jpg", alt: "Breakfast burrito" },
                { src: "/images/beef-quesadilla.jpg", alt: "Beef quesadilla" },
              ].map((photo) => <div key={photo.src}><Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 640px) 33vw, 50vw" /></div>)}
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {featuredSections.map((section) => (
                <article key={section.id} className="border-t border-[#bac5b5]">
                  <div className="border-b border-[#d4d9ca] py-4">
                    <h3 className="font-display text-3xl text-[#173d2c]">{section.title}</h3>
                  </div>

                  <div className="space-y-4 py-4">
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
                              <p className="text-sm font-semibold text-[#173d2c]">{item.name}</p>
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
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
