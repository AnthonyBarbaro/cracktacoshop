import type { Metadata } from "next";

import MainPhoneCard from "@/components/MainPhoneCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Crack Taco Shop and connect with our San Diego locations.",
  alternates: {
    canonical: `${site.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
              Contact
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Connect With Crack Taco Shop
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
              For immediate orders, call your nearest location. You can also connect with us on
              social channels for updates and specials.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="grid gap-4 md:grid-cols-3">
            <MainPhoneCard />

            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-black/30 p-5"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-brand-yellow">Instagram</p>
              <p className="mt-2 text-sm font-semibold text-white">@cracktacoshopsd</p>
            </a>

            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-black/30 p-5"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-brand-yellow">Facebook</p>
              <p className="mt-2 text-sm font-semibold text-white">facebook.com/cracktacoshop</p>
            </a>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8">
            <h2 className="font-display text-3xl text-white sm:text-4xl">All Store Contacts</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {locations.map((location) => {
                const directionsUrl = getGoogleMapsDirectionsUrl({
                  address: location.address,
                  placeId: location.placeId,
                });

                return (
                  <article
                    key={location.slug}
                    className="rounded-xl border border-white/10 bg-black/35 p-4 text-sm"
                  >
                    <p className="font-semibold text-white">{location.name}</p>
                    <p className="mt-1 text-white/70">{location.address}</p>
                    <p className="mt-2 text-white/65">{location.hours}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {location.phone && (
                        <a
                          href={`tel:${location.phone}`}
                          className="inline-flex w-full font-semibold text-brand-yellow sm:w-auto"
                        >
                          {location.phone}
                        </a>
                      )}
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brand-btn-directions w-full px-3 py-2 text-sm sm:w-auto"
                      >
                        Get Directions
                      </a>
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
