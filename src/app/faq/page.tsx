import type { Metadata } from "next";
import Script from "next/script";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { faqItems, site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about locations, hours, menu, and online ordering.",
  alternates: {
    canonical: `${site.url}/faq`,
  },
};

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
              FAQ
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-neutral-950 sm:text-4xl lg:text-5xl">
              Common questions
            </h1>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="space-y-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-lg border border-neutral-200 bg-white p-5">
                <h2 className="font-display text-2xl text-neutral-950">{item.question}</h2>
                <p className="mt-2 text-sm text-neutral-600 sm:text-base">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
