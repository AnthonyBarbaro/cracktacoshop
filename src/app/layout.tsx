import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";

import { site } from "@/data/site-content";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Crack Taco Shop San Diego",
    template: "%s | Crack Taco Shop",
  },
  description: "Tri-tip tacos, burritos, and online ordering across San Diego locations.",
  applicationName: "Crack Taco Shop",
  keywords: [
    "crack taco shop",
    "san diego tacos",
    "tri-tip tacos",
    "burritos",
    "order online tacos",
    "cardiff crack",
  ],
  authors: [{ name: "Crack Taco Shop" }],
  creator: "Crack Taco Shop",
  publisher: "Crack Taco Shop",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
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
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable} antialiased`}>{children}</body>
    </html>
  );
}
