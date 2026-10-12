import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteIcon from "@/components/SiteIcon";
import { foodShowcase, highlights, site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn the story behind Prime Tacos and our tri-tip taco tradition.",
  alternates: {
    canonical: `${site.url}/our-story`,
  },
  openGraph: {
    title: "Our Story",
    description: "Learn the story behind Prime Tacos and our tri-tip taco tradition.",
    url: `${site.url}/our-story`,
    images: ["/newlogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Story",
    description: "Learn the story behind Prime Tacos and our tri-tip taco tradition.",
    images: ["/newlogo.png"],
  },
};

export default function OurStoryPage() {
  const kitchenPhotos = foodShowcase.filter((item) =>
    ["/images/food-1.jpg", "/images/food-3.jpg", "/images/beef-quesadilla.jpg"].includes(item.src),
  );

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="secondary-page story-page">
        <section className="section-shell page-intro story-hero" aria-labelledby="story-title">
          <div className="story-hero-copy">
            <p className="page-kicker">Our Story</p>
            <h1 id="story-title" className="page-title">San Diego roots.<br /><em>Prime flavor.</em></h1>
            <p className="page-description">{site.story}</p>
            <div className="story-hero-actions">
              <Link href="/order-online" className="brand-btn px-5 py-3 text-sm">
                Order online<SiteIcon name="arrow" className="h-4 w-4" />
              </Link>
              <Link href="/locations" className="text-link">
                Find your Prime<SiteIcon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <figure className="story-hero-photo">
            <div className="story-hero-image relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/al-pastor-street-tacos.jpg"
                alt="Al pastor street taco with pineapple, guacamole, onion, cilantro, and lime"
                fill
                sizes="(max-width: 800px) 100vw, 45vw"
                className="object-cover"
                priority
              />
            </div>
            <figcaption>Al pastor street tacos, from our kitchen.</figcaption>
          </figure>
        </section>

        <section className="section-shell page-section" aria-label="What makes Prime Tacos">
          <div className="story-values">
            {highlights.map((item, index) => (
              <article key={item.title} className="story-value">
                <span className="story-value-number" aria-hidden="true">0{index + 1}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell page-section" aria-labelledby="story-roots-title">
          <div className="story-note">
            <div className="story-note-heading">
              <p className="page-kicker">What matters to us</p>
              <h2 id="story-roots-title">
                Good food.<br /><em>Good company.</em>
              </h2>
            </div>
            <div className="story-note-copy">
              <p>
                Prime Tacos is proudly San Diego based, built around quality food, fast service, and a team that
                treats guests like regulars from day one.
              </p>
              <p>
                From grand openings to daily lunch rushes, we keep the same goal: bold flavor, consistent execution,
                and a welcoming vibe in every shop.
              </p>
            </div>
          </div>
        </section>

        <section className="section-shell page-section" aria-labelledby="story-kitchen-title">
          <div className="story-gallery-heading">
            <div>
              <p className="page-kicker">From our kitchen</p>
              <h2 id="story-kitchen-title">A taste of Prime.</h2>
            </div>
            <Link href="/menu" className="text-link">Explore the menu<SiteIcon name="arrow" className="h-4 w-4" /></Link>
          </div>
          <div className="story-gallery">
            {kitchenPhotos.map((item) => (
              <figure key={item.src} className="story-gallery-photo">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={860}
                  height={820}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="aspect-[4/5] w-full object-cover"
                />
                <figcaption>{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
