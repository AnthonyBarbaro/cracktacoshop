import type { MetadataRoute } from "next";

import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "locations",
    "our-story",
    "careers",
    "faq",
    "order-online",
    "catering",
  ];

  return [
    {
      url: site.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...staticPages.map((page) => ({
      url: `${site.url}/${page}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...locations.map((location) => ({
      url: `${site.url}/locations/${location.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
