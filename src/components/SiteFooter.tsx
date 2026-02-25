import Image from "next/image";
import Link from "next/link";

import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

export default function SiteFooter() {
  const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/our-story", label: "Our Story" },
    { href: "/specials", label: "Specials" },
    { href: "/reviews", label: "Reviews" },
    { href: "/careers", label: "Careers" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/locations", label: "Locations" },
    { href: "/order-online", label: "Order Online" },
  ];

  return (
    <footer className="border-t border-white/10 bg-black/55">
      <div className="section-shell grid gap-10 py-12 md:grid-cols-[1.1fr_1fr_1fr]">
        <div className="space-y-4">
          <Image src="/logo.png" alt="Crack Taco Shop" width={170} height={64} />
          <p className="max-w-sm text-sm text-white/70">{site.tagline}</p>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-btn-muted px-3 py-2"
            >
              Instagram
            </a>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-btn-muted px-3 py-2"
            >
              Facebook
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl text-white">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-white">Locations & Phones</h3>
          <ul className="mt-4 space-y-4 text-sm">
            {locations.map((location) => (
              <li key={location.slug} className="text-white/75">
                <p className="font-semibold text-white">{location.name}</p>
                <p>{location.address}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {location.phone ? (
                    <a href={`tel:${location.phone}`} className="font-semibold text-brand-yellow">
                      {location.phone}
                    </a>
                  ) : (
                    <p className="text-white/60">Phone available at location</p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-btn-directions px-3 py-1.5 text-xs"
                  >
                    Directions
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-sm text-white/65">
        © Crack Taco Shop. All rights reserved.
      </div>
    </footer>
  );
}
