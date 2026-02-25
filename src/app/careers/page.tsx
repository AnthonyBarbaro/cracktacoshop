import type { Metadata } from "next";

import CareersApplicationForm from "@/components/CareersApplicationForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Careers",
  description: "Apply for open positions at Crack Taco Shop locations.",
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
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">
              Careers
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Join the Crack Taco Shop Team
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
              We are hiring team members who care about hospitality, food quality, and speed. Fill
              out the application below and our team will review it.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-sm text-white/80">
              Simple application. Please include your contact info, preferred location, and resume.
            </p>
          </div>
        </section>

        <section className="section-shell mt-10">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8">
            <h2 className="font-display text-3xl text-white sm:text-4xl">Career Application</h2>
            <p className="mt-2 text-sm text-white/70">
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
