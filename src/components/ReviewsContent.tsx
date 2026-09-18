"use client";

import type { ReactElement } from "react";

import { reviews, site } from "@/data/site-content";
import { useShoppingLocation } from "@/lib/use-shopping-location";

export default function ReviewsContent(): ReactElement {
  const selectedLocation = useShoppingLocation();
  const displayedReviews = selectedLocation
    ? reviews.filter((review) => review.locationVisited === selectedLocation.name)
    : reviews;
  const renderStars = (): ReactElement => (
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
    name: selectedLocation ? `${site.shortName} ${selectedLocation.name}` : site.shortName,
    url: selectedLocation ? `${site.url}/locations/${selectedLocation.slug}` : site.url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: displayedReviews.length,
    },
    review: displayedReviews.map((entry) => ({
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
      <script
        id="reviews-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
              Reviews
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-neutral-950 sm:text-4xl lg:text-5xl">
              {selectedLocation ? `${selectedLocation.name} reviews` : "What our guests say"}
            </h1>
            <div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2">
              {renderStars()}
              <p className="text-sm font-semibold text-neutral-950">5-Star Customer Feedback</p>
            </div>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="review-mobile-track">
            {displayedReviews.map((review, index) => (
              <article
                key={`${review.author}-${index}`}
                className="review-card review-mobile-slide rounded-lg border border-neutral-200 bg-white p-5"
              >
                <p className="font-semibold text-neutral-950">{review.author}</p>
                <p className="mt-1 text-xs text-neutral-600">{review.reviewerStats}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  {renderStars()}
                  <p className="text-xs text-neutral-600">{review.timeAgo}</p>
                </div>
                <p className="mt-2 text-xs text-brand-green">Visited: {review.locationVisited}</p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">“{review.quote}”</p>
                <p className="mt-4 text-xs font-medium text-neutral-600">
                  Posted on Google Reviews
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
