import type { ReactElement } from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";

import CookieNotice from "@/components/CookieNotice";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import { socialImage } from "@/data/social-image";

import "./globals.css";
import "./accessibility.css";

const primaryFont = DM_Sans({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Prime Taco Shop San Diego",
    template: "%s | Prime Taco Shop",
  },
  description: "Tri-tip tacos, burritos, and online ordering across San Diego locations.",
  alternates: {
    canonical: site.url,
  },
  category: "restaurant",
  applicationName: "Prime Taco Shop",
  keywords: [
    "prime taco shop",
    "san diego tacos",
    "tri-tip tacos",
    "burritos",
    "order online tacos",
    "mission valley tacos",
    "seaport village tacos",
    "encinitas tacos",
    "coronado tacos",
    "san diego burritos",
    "late night tacos san diego",
  ],
  authors: [{ name: "Prime Taco Shop" }],
  creator: "Prime Taco Shop",
  publisher: "Prime Taco Shop",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  icons: {
    icon: [{ url: "/newlogo.png", type: "image/png" }],
    shortcut: "/newlogo.png",
    apple: [{ url: "/newlogo.png", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.shortName,
    title: "Prime Taco Shop San Diego",
    description: "Tri-tip tacos, burritos, and easy online ordering by location.",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Taco Shop San Diego",
    description: "Tri-tip tacos, burritos, and easy online ordering by location.",
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f7f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): ReactElement {
  const globalSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.shortName,
        url: site.url,
        logo: `${site.url}/newlogo.png`,
        image: `${site.url}/images/al-pastor-street-tacos.jpg`,
        sameAs: [site.instagram],
        areaServed: "San Diego County",
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: "en-US",
        publisher: {
          "@id": `${site.url}/#organization`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${site.url}/#locations-list`,
        name: "Prime Taco Shop Locations",
        itemListElement: locations.map((location, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: location.name,
          url: `${site.url}/locations/${location.slug}`,
        })),
      },
    ],
  };

  return (
    <html lang="en" className={primaryFont.variable}>
      <body className="antialiased">
        <script
          id="global-seo-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema).replace(/</g, "\u003c") }}
        />
        {children}
        <CookieNotice />
        <AccessibilityWidget />
      </body>
    </html>
  );
}
