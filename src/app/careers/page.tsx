import type { Metadata } from "next";

import CareersApplicationForm from "@/components/CareersApplicationForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Careers",
  description: "Apply for open positions at Prime Tacos locations.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="pb-20 pt-10 sm:pt-12">
        <section className="section-shell">
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
              Careers
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl text-neutral-950 sm:text-4xl lg:text-5xl">
              Join our team
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
              We are hiring team members who care about hospitality, food quality, and speed. Fill
              out the application below and our team will review it.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="max-w-3xl border-t border-neutral-200 pt-6">
            <h2 className="font-display text-2xl text-neutral-950 sm:text-3xl">Apply now</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Submit your name, email, phone, preferred location, and resume. Message is optional.
              Accepted resume formats: PDF or DOCX (max 10MB).
            </p>
            <div className="mt-5">
              <CareersApplicationForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
