import type { Metadata, Viewport } from "next";
import { Bungee, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const bungee = Bungee({
  variable: "--font-sora",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Crack Taco Shop San Diego",
    template: "%s | Crack Taco Shop",
  },
  description: "Tri-tip tacos, burritos, and online ordering across San Diego locations.",
  alternates: {
    canonical: site.url,
  },
  category: "restaurant",
  applicationName: "Crack Taco Shop",
  keywords: [
    "crack taco shop",
    "san diego tacos",
    "tri-tip tacos",
    "burritos",
    "order online tacos",
    "cardiff crack",
    "mission valley tacos",
    "seaport village tacos",
    "encinitas tacos",
    "coronado tacos",
    "san diego burritos",
    "late night tacos san diego",
  ],
  authors: [{ name: "Crack Taco Shop" }],
  creator: "Crack Taco Shop",
  publisher: "Crack Taco Shop",
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
  other: {
    "geo.region": "US-CA",
    "geo.placename": "San Diego",
    ICBM: "32.7157, -117.1611",
  },
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.shortName,
    title: "Crack Taco Shop San Diego",
    description: "Tri-tip tacos, burritos, and easy online ordering by location.",
    images: [
      {
        url: "/logo.png",
        width: 276,
        height: 105,
        alt: "Crack Taco Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crack Taco Shop San Diego",
    description: "Tri-tip tacos, burritos, and easy online ordering by location.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090909",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.shortName,
        url: site.url,
        logo: `${site.url}/logo.png`,
        image: `${site.url}/images/taco.jpg`,
        telephone: site.phone,
        sameAs: [site.instagram, site.facebook],
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
        name: "Crack Taco Shop Locations",
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
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${bungee.variable} antialiased`}>
        <Script
          id="global-seo-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
