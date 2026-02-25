import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getFlattenedMenuItems, getMenuForLocation } from "@/data/menu";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

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
              Every location uses the same menu structure so guests can browse quickly on phones and
              jump to sections like tacos, burritos, breakfast, and beverages.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {locations.map((location) => (
              <article
                key={location.slug}
                className="rounded-xl border border-white/10 bg-black/30 p-4 text-white"
              >
                <p className="font-display text-2xl text-white">{location.name}</p>
                <p className="mt-1 text-xs text-white/70">{location.hours}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/menu/${location.slug}/embed`}
                    className="brand-btn w-full px-3 py-2 text-sm sm:w-auto"
                  >
                    Open Menu
                  </Link>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="brand-btn-muted w-full px-3 py-2 text-sm sm:w-auto"
                  >
                    Location
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8">
            <h2 className="font-display text-3xl text-white sm:text-4xl">Featured Menu Preview</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredSections.map((section) => (
                <article key={section.id} className="rounded-xl border border-white/12 bg-black/35">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="font-display text-xl text-white">{section.title}</p>
                  </div>

                  <div className="space-y-3 px-4 py-3">
                    {section.groups.slice(0, 2).map((group) => (
                      <div key={`${section.id}-${group.title}`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                          {group.title}
                        </p>
                        <ul className="mt-2 space-y-2">
                          {group.items.slice(0, 3).map((item) => (
                            <li key={`${section.id}-${group.title}-${item.name}`}>
                              <p className="text-sm text-white/90">{item.name}</p>
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
