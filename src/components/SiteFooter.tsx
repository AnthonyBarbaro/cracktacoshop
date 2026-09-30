"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";

import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import SiteIcon from "@/components/SiteIcon";
import { openCookieSettings } from "@/lib/cookie-preferences";
import { getMenuHref } from "@/lib/menu-link";
import { useShoppingLocation } from "@/lib/use-shopping-location";

type Props = {
  variant?: "default" | "minimal";
};

export default function SiteFooter({ variant = "default" }: Props): ReactElement {
  const shoppingLocation = useShoppingLocation();
  const menuHref = getMenuHref(shoppingLocation);
  const footerLinks = [
    { href: menuHref, label: "Menu" },
    { href: "/locations", label: "Locations" },
    { href: "/our-story", label: "Our story" },
    { href: "/reviews", label: "Reviews" },
    { href: "/careers", label: "Careers" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  if (variant === "minimal") {
    return (
      <footer className="site-footer is-editorial">
        <div className="section-shell footer-main">
          <div>
            <Link href="/" aria-label="Prime Tacos home"><Image src="/newlogo.png" alt="Prime Tacos" width={3822} height={2378} sizes="144px" className="footer-logo" /></Link>
            <p>{site.tagline}<br />San Diego, California.</p>
          </div>
          <nav aria-label="Footer navigation" className="footer-links">
            {footerLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
          <div className="footer-order">
            <Link href="/order-online" className="brand-btn px-6 py-3 text-xs">Order online<SiteIcon name="arrow" className="h-4 w-4" /></Link>
            <div className="mt-5 flex gap-5 text-sm">
              <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href={site.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
          </div>
        </div>
        <div className="section-shell footer-bottom">
          <p>© {new Date().getFullYear()} Prime Tacos.</p>
          <button type="button" onClick={openCookieSettings} className="min-h-11 underline underline-offset-4">Cookie settings</button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="section-shell footer-main">
        <div>
          <Link href="/" aria-label="Prime Tacos home"><Image src="/newlogo.png" alt="Prime Tacos" width={3822} height={2378} sizes="144px" className="footer-logo" /></Link>
          <p className="mt-4 text-sm text-white/70">{site.tagline} Proudly San Diego.</p>
        </div>
        <nav aria-label="Footer navigation" className="footer-links">
          {footerLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="footer-order">
          <p className="font-display text-2xl">Hungry yet?</p>
          <Link href="/order-online" className="brand-btn mt-4 gap-3 px-6 py-4 text-sm">Order online<SiteIcon name="arrow" /></Link>
          <div className="mt-5 flex gap-5 text-sm text-white/75">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={site.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
      </div>
      <section className="section-shell border-t border-white/15 py-8" aria-labelledby="footer-locations-title">
        <h2 id="footer-locations-title" className="font-display text-xl">Our locations</h2>
        <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((location) => (
            <li key={location.slug}>
              <h3 className="font-display text-base font-semibold">
                <Link href={`/locations/${location.slug}`} className="hover:underline hover:underline-offset-4">{location.name}</Link>
              </h3>
              <div className="mt-2 flex flex-col items-start text-sm">
                {location.phone && (
                  <a href={`tel:${location.phone}`} aria-label={`Call ${location.name} at ${location.phone}`} className="inline-flex min-h-11 items-center gap-2 text-white/75 hover:text-white hover:underline hover:underline-offset-4">
                    <SiteIcon name="phone" className="h-4 w-4" />{location.phone}
                  </a>
                )}
                <Link href={getMenuHref(location)} aria-label={`View ${location.name} menu`} className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline hover:underline-offset-4">
                  View menu<SiteIcon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <div className="section-shell footer-bottom">
        <p>© {new Date().getFullYear()} Prime Tacos. All rights reserved.</p>
        <button type="button" onClick={openCookieSettings} className="min-h-11 underline underline-offset-4">Cookie settings</button>
        <p>San Diego, California</p>
      </div>
    </footer>
  );
}
