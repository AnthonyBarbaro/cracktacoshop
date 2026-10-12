import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteIcon from "@/components/SiteIcon";
import { faqItems, site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about locations, hours, menu, and online ordering.",
  alternates: {
    canonical: `${site.url}/faq`,
  },
  openGraph: {
    title: "FAQ",
    description: "Frequently asked questions about locations, hours, menu, and online ordering.",
    url: `${site.url}/faq`,
    images: ["/newlogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ",
    description: "Frequently asked questions about locations, hours, menu, and online ordering.",
    images: ["/newlogo.png"],
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
      <main id="main-content" className="secondary-page">
        <section className="section-shell page-intro faq-layout" aria-labelledby="faq-title">
          <div className="faq-intro">
            <p className="page-kicker">FAQ</p>
            <h1 id="faq-title" className="page-title">Good to <em>know.</em></h1>
            <p className="page-description">Find details about our locations, hours, menu, and online ordering.</p>
            <Link href="/locations" className="text-link mt-6">
              Locations and hours<SiteIcon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <div className="faq-list">
            {faqItems.map((item) => (
              <details key={item.question} className="faq-item">
                <summary className="faq-summary">
                  <h2>{item.question}</h2>
                  <span aria-hidden="true" className="faq-toggle" />
                </summary>
                <p className="faq-answer">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
