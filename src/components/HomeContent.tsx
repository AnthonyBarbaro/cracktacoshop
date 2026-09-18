"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";

import HeroPhotoCarousel from "@/components/HeroPhotoCarousel";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteIcon from "@/components/SiteIcon";
import { locations } from "@/data/locations";
import { useShoppingLocation } from "@/lib/use-shopping-location";

export default function HomeContent(): ReactElement {
  const shoppingLocation = useShoppingLocation();
  const visibleLocations = shoppingLocation ? [shoppingLocation] : locations;
  const menuHref = shoppingLocation ? `/menu/${shoppingLocation.slug}/embed` : "/menu";
  const orderHref = shoppingLocation ? menuHref : "/order-online";
  const favorites = [
    { name: "Tri-tip tacos", image: "/images/food-1.jpg", description: "Our signature bite.", alt: "Tri-tip taco with guacamole, onion, and fresh salsa" },
    { name: "Al pastor", image: "/images/al-pastor-street-tacos.jpg", description: "A little sweet. A little heat.", alt: "Al pastor taco with pineapple and guacamole" },
    { name: "Quesadillas", image: "/images/beef-quesadilla.jpg", description: "All the cheesy goodness.", alt: "Beef quesadilla with guacamole and crema" },
    { name: "Breakfast burritos", image: "/images/legacy/breakfast-burrito.jpg", description: "Start your day the Prime way.", alt: "Breakfast burrito served with fresh toppings" },
  ];

  return (
    <main id="main-content">
      <section className="prime-hero" aria-labelledby="hero-title">
        <div className="prime-hero-copy">
          <p className="eyebrow">Home of the tri-tip taco</p>
          <h1 id="hero-title">{shoppingLocation ? <>Prime Tacos.<br /><span>{shoppingLocation.name}.</span></> : <>Big flavor.<br /><span>Prime tacos.</span></>}</h1>
          <p className="hero-description">{shoppingLocation ? shoppingLocation.address : "Tri-tip tacos. Handmade tortillas. Your new everyday favorite, right here in San Diego."}</p>
          {shoppingLocation && <p className="mt-2 text-sm text-white/80">{shoppingLocation.hours}</p>}
          <div className="hero-actions">
            <Link href={orderHref} className="brand-btn px-6 py-4 text-sm">Order online<SiteIcon name="arrow" /></Link>
            <Link href={menuHref} className="hero-menu-link">Explore the menu<SiteIcon name="arrow" /></Link>
          </div>
          <Link href={shoppingLocation ? `/locations/${shoppingLocation.slug}` : "#locations"} className="hero-location-link"><SiteIcon name="pin" />{shoppingLocation ? "Hours & location details" : "Four San Diego locations"}</Link>
        </div>
        <HeroPhotoCarousel key={shoppingLocation?.slug ?? "all-locations"} location={shoppingLocation} />
      </section>

      <section id="favorites" className="home-section section-shell" aria-labelledby="favorites-title">
        <div className="section-heading-row">
          <div><p className="eyebrow">Fresh from our kitchen</p><h2 id="favorites-title">Find your favorite.</h2></div>
          <Link href={menuHref} className="text-link">Full menu<SiteIcon name="arrow" /></Link>
        </div>
        <div className="favorites-grid">
          {favorites.map((item) => (
            <Link key={item.name} href={menuHref} className="favorite-card">
              <div className="favorite-image"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 639px) 50vw, (max-width: 1023px) 45vw, 25vw" className="object-cover" /></div>
              <div className="favorite-copy"><h3>{item.name}</h3><p>{item.description}</p><span className="favorite-arrow"><SiteIcon name="arrow" /></span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="prime-story-band">
        <div className="section-shell story-band-inner">
          <div><p className="eyebrow">Good food. Good company.</p><h2>A San Diego original.<br />A fresh new name.</h2></div>
          <div><p>Meet Prime Tacos. Burgundy pepper tri-tip, homemade corn tortillas, and the flavors you come back for.</p><Link href="/our-story" className="text-link">Our story<SiteIcon name="arrow" /></Link></div>
        </div>
      </section>

      <section id="locations" className="home-section section-shell" aria-labelledby="locations-title">
        <div className="section-heading-row">
          <div><p className="eyebrow">Your next taco stop</p><h2 id="locations-title">{shoppingLocation ? `Visit ${shoppingLocation.name}.` : "Find your Prime."}</h2></div>
          <Link href="/locations" className="text-link">All locations<SiteIcon name="arrow" /></Link>
        </div>
        <div className="home-locations">
          {visibleLocations.map((location, index) => (
            <article key={location.slug} className="home-location-row">
              <span className="location-number" aria-hidden="true">0{index + 1}</span>
              <div className="location-info"><div className="flex flex-wrap items-center gap-3"><h3>{location.name}</h3><LocationOpenBadge slug={location.slug} /></div><p>{location.address}</p><p className="location-hours">{location.hours}</p></div>
              <div className="location-actions"><Link href={`/locations/${location.slug}`} className="text-link" aria-label={`View ${location.name} details`}>Details<SiteIcon name="arrow" /></Link><Link href={`/menu/${location.slug}/embed`} className="brand-btn px-5 py-3 text-xs" aria-label={`Order from ${location.name}`}>Order online</Link></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
