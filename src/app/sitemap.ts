import type { MetadataRoute } from "next";

import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = [
    "locations",
    "menu",
    "our-story",
    "reviews",
    "careers",
    "faq",
    "contact",
    "order-online",
  ];

  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...staticPages.map((page) => ({
      url: `${site.url}/${page}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...locations.map((location) => ({
      url: `${site.url}/locations/${location.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...locations.map((location) => ({
      url: `${site.url}/menu/${location.slug}/embed`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
