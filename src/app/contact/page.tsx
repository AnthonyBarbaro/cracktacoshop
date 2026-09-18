import type { Metadata } from "next";

import ContactContent from "@/components/ContactContent";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Prime Tacos and connect with our San Diego locations.",
  alternates: {
    canonical: `${site.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <ContactContent />
      <SiteFooter />
    </>
  );
}
