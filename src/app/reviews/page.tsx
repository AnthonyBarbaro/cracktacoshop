import type { Metadata } from "next";

import ReviewsContent from "@/components/ReviewsContent";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Read customer testimonials and local praise for Prime Tacos.",
  alternates: {
    canonical: `${site.url}/reviews`,
  },
};

export default function ReviewsPage() {
  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <ReviewsContent />
      <SiteFooter />
    </>
  );
}
