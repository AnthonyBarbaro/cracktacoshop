import type { ReactElement } from "react";
import type { Metadata } from "next";

import HomeContent from "@/components/HomeContent";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/data/site-content";
import { socialImage } from "@/data/social-image";

const title = "Prime Taco Shop | Tri-Tip Tacos & Burritos in San Diego";
const description = "Find Prime Taco Shop in Mission Valley, Seaport Village, Coronado and Encinitas. Explore tri-tip tacos and burritos, view menus and order pickup.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: site.url,
  },
  openGraph: {
    title,
    description,
    url: site.url,
    siteName: site.shortName,
    locale: "en_US",
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export default function HomePage(): ReactElement {
  return (
    <>
      <SiteHeader />
      <HomeContent />
      <SiteFooter variant="minimal" />
    </>
  );
}
