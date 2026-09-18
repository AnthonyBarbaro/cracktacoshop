import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { foodShowcase, highlights, site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn the story behind Prime Tacos and our tri-tip taco tradition.",
  alternates: {
    canonical: `${site.url}/our-story`,
  },
};

export default function OurStoryPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
              Our Story
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-neutral-950 sm:text-4xl lg:text-5xl">
              Welcome to Prime Tacos
            </h1>
            <p className="mt-4 max-w-3xl text-sm text-neutral-600 sm:text-base">{site.story}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link href="/order-online" className="brand-btn w-full px-5 py-3 text-sm sm:w-auto">
                Order Online
              </Link>
              <Link href="/locations" className="brand-btn-muted w-full px-5 py-3 text-sm sm:w-auto">
                View Locations
              </Link>
            </div>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-neutral-200 bg-white p-5 text-neutral-600"
              >
                <h2 className="font-display text-2xl text-neutral-950">{item.title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="grid items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <figure className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 sm:p-3">
              <div className="relative h-[24rem] overflow-hidden rounded-lg bg-white sm:h-[30rem] lg:h-[38rem]">
                <Image
                  src="/images/family.png"
                  alt="Prime Tacos team celebrating the Coronado opening"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain"
                  priority
                />
              </div>
            </figure>

            <article className="py-4 lg:px-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
                San Diego Roots
              </p>
              <h2 className="mt-3 font-display text-3xl text-neutral-950 sm:text-4xl">
                Rooted in San Diego
              </h2>
              <p className="mt-4 text-sm text-neutral-600 sm:text-base">
                Prime Tacos is proudly San Diego based, built around quality food, fast service, and a team that
                treats guests like regulars from day one.
              </p>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                From grand openings to daily lunch rushes, we keep the same goal: bold flavor, consistent execution,
                and a welcoming vibe in every shop.
              </p>
            </article>
          </div>
        </section>

        <section className="section-shell mt-10">
          <h2 className="font-display text-3xl text-neutral-950 sm:text-4xl">From our kitchen</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {foodShowcase.map((item) => (
              <figure
                key={item.src}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={860}
                  height={820}
                  className="h-64 w-full object-cover"
                />
                <figcaption className="px-4 py-3 text-sm text-neutral-600">{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
