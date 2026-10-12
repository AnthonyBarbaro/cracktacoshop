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
  openGraph: {
    title: "Careers",
    description: "Apply for open positions at Prime Tacos locations.",
    url: "/careers",
    images: ["/newlogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers",
    description: "Apply for open positions at Prime Tacos locations.",
    images: ["/newlogo.png"],
  },
};

export default function CareersPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="secondary-page">
        <section className="section-shell page-intro">
          <div className="max-w-3xl">
            <p className="page-kicker">Careers</p>
            <h1 className="page-title">Join <em>our team.</em></h1>
            <p className="page-description">
              We are hiring team members who care about hospitality, food quality, and speed. Fill
              out the application below and our team will review it.
            </p>
          </div>
        </section>

        <section className="section-shell page-section" aria-labelledby="application-title">
          <div className="careers-layout">
            <div className="careers-note">
              <p className="page-kicker">Your application</p>
              <h2 id="application-title">Tell us about yourself.</h2>
              <p>
                Submit your name, email, phone, preferred location, and resume. Message is optional.
              </p>
              <p>Accepted resume formats: PDF or DOCX (max 10MB).</p>
            </div>
            <div className="surface-panel careers-form-panel"><CareersApplicationForm /></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
