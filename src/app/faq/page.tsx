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
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
              FAQ
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Frequently Asked Questions
            </h1>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="space-y-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-xl border border-white/12 bg-black/30 p-5">
                <h2 className="font-display text-2xl text-white">{item.question}</h2>
                <p className="mt-2 text-sm text-white/75 sm:text-base">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
