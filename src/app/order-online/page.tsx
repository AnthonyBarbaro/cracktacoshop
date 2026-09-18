import type { Metadata } from "next";

import OrderOnlineContent from "@/components/OrderOnlineContent";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Order Online",
  description: "Order online from Prime Tacos locations using pickup and delivery options.",
  alternates: {
    canonical: `${site.url}/order-online`,
  },
};

export default function OrderOnlinePage() {
  return (
    <>
      <SiteHeader ctaHref="/locations" ctaLabel="View Locations" />
      <OrderOnlineContent />
      <SiteFooter />
    </>
  );
}
