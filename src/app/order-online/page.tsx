import type { Metadata } from "next";

import OrderOnlineContent from "@/components/OrderOnlineContent";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/data/site-content";
import { socialImage } from "@/data/social-image";

export const metadata: Metadata = {
  title: "Order Online",
  description: "Order online from Prime Tacos locations using pickup and delivery options.",
  alternates: {
    canonical: `${site.url}/order-online`,
  },
  openGraph: {
    title: "Order Online",
    description: "Order online from Prime Tacos locations using pickup and delivery options.",
    url: `${site.url}/order-online`,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Order Online",
    description: "Order online from Prime Tacos locations using pickup and delivery options.",
    images: [socialImage],
  },
};

export default function OrderOnlinePage() {
  return (
    <>
      <SiteHeader />
      <OrderOnlineContent />
      <SiteFooter />
    </>
  );
}
