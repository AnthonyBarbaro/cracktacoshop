import type { Metadata } from "next";
import Script from "next/script";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { reviews, site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Read customer testimonials and local praise for Crack Taco Shop.",
  alternates: {
    canonical: `${site.url}/reviews`,
  },
};

export default function ReviewsPage() {
  const renderStars = () => (
    <div className="review-stars" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, starIndex) => (
        <svg key={starIndex} viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="m10 1.7 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L10 1.7Z" />
        </svg>
      ))}
    </div>
  );

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.shortName,
    url: site.url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: reviews.length,
    },
    review: reviews.map((entry) => ({
      "@type": "Review",
      reviewBody: entry.quote,
      reviewRating: {
        "@type": "Rating",
        ratingValue: entry.rating ?? 5,
        bestRating: 5,
      },
      author: {
        "@type": "Person",
        name: entry.author,
      },
    })),
  };

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <Script
        id="reviews-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
              Reviews
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              What Customers and Local Media Are Saying
            </h1>
            <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-white/12 bg-black/35 px-3 py-2">
              {renderStars()}
              <p className="text-sm font-semibold text-white">5-Star Customer Feedback</p>
            </div>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="review-mobile-track">
            {reviews.map((review, index) => (
              <article
                key={`${review.author}-${index}`}
                className="review-card review-card-animate review-mobile-slide rounded-2xl border border-white/10 bg-black/35 p-5"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className="font-semibold text-white">{review.author}</p>
                <p className="mt-1 text-xs text-white/65">{review.reviewerStats}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  {renderStars()}
                  <p className="text-xs text-white/60">{review.timeAgo}</p>
                </div>
                <p className="mt-2 text-xs text-brand-yellow">Visited: {review.locationVisited}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/80">“{review.quote}”</p>
                <p className="mt-4 text-xs font-medium text-white/55">
                  Posted on Google Reviews
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
