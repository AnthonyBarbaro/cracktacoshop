import type { Metadata } from "next";
import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site, specials } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Specials",
  description: "Current specials and featured items from Crack Taco Shop.",
  alternates: {
    canonical: `${site.url}/specials`,
  },
};

export default function SpecialsPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
              Specials
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Featured Offers and Crowd Favorites
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">
              Availability may vary by location and time of day.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="grid gap-4 md:grid-cols-3">
            {specials.map((special) => (
              <article
                key={special.title}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white"
              >
                <h2 className="font-display text-2xl text-white">{special.title}</h2>
                <p className="mt-3 text-sm text-white/75">{special.details}</p>
                <Link href="/order-online" className="brand-btn mt-5 px-4 py-2 text-sm">
                  Order This
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8">
            <h2 className="font-display text-3xl text-white sm:text-4xl">Order by Location</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {locations.map((location) => {
                const quickOrderUrl =
                  location.toastUrl ?? location.doorDash ?? location.grubHub ?? location.uberEats;

                return (
                  <article
                    key={location.slug}
                    className="rounded-xl border border-white/10 bg-black/35 p-4"
                  >
                    <p className="font-semibold text-white">{location.name}</p>
                    <p className="mt-1 text-xs text-white/65">{location.hours}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickOrderUrl && (
                        <a
                          href={quickOrderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="brand-btn w-full px-3 py-2 text-sm sm:w-auto"
                        >
                          Order
                        </a>
                      )}
                      <Link
                        href={`/locations/${location.slug}`}
                        className="brand-btn-muted w-full px-3 py-2 text-sm sm:w-auto"
                      >
                        Details
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
