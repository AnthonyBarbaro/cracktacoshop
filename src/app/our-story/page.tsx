import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { foodShowcase, highlights, site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn the story behind Crack Taco Shop and our tri-tip taco tradition.",
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
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
              Our Story
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Using the World Famous Burgundy Pepper Tri-Tip Since 1985
            </h1>
            <p className="mt-4 max-w-3xl text-sm text-white/75 sm:text-base">{site.story}</p>
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
                className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/90"
              >
                <h2 className="font-display text-2xl text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-white/75">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell mt-10">
          <h2 className="font-display text-3xl text-white sm:text-4xl">Food Showcase</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {foodShowcase.map((item) => (
              <figure
                key={item.src}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/35"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={860}
                  height={820}
                  className="h-64 w-full object-cover"
                />
                <figcaption className="px-4 py-3 text-sm text-white/80">{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
