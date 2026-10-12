"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactElement } from "react";

import DeliveryButton from "@/components/DeliveryButton";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import HomeLogoIntro from "@/components/HomeLogoIntro";
import SiteIcon from "@/components/SiteIcon";
import { locations } from "@/data/locations";
import { signatureDishes } from "@/data/site-content";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { getMenuHref } from "@/lib/menu-link";
import { useShoppingLocation } from "@/lib/use-shopping-location";

export default function HomeContent(): ReactElement {
  const shoppingLocation = useShoppingLocation();
  const menuHref = getMenuHref(shoppingLocation);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = main.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    sections.forEach((section) => observer.observe(section));
    main.classList.add("motion-ready");

    let frame = 0;
    const update = (): void => {
      frame = 0;
      const progress = preference.matches ? 0 : Math.min(window.scrollY / 700, 1);
      main.style.setProperty("--hero-shift", `${progress * 70}px`);
    };
    const onScroll = (): void => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    preference.addEventListener("change", onScroll);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      preference.removeEventListener("change", onScroll);
      main.classList.remove("motion-ready");
    };
  }, []);

  return (
    <main ref={mainRef} id="main-content" className="home-editorial">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-media">
          <Image src="/images/al-pastor-street-tacos.jpg" alt="Al pastor taco with pineapple, guacamole, onion, and lime" fill sizes="(min-width: 800px) 65vw, 100vw" priority className="home-hero-photo" />
        </div>
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="home-kicker">San Diego, California</p>
            <HomeLogoIntro />
            <h1 id="home-title">San Diego roots.<br /><em>Prime tacos.</em></h1>
            <p className="home-hero-description">Burgundy pepper tri-tip. Handmade tortillas.<br />Your next favorite taco.</p>
            <div className="home-hero-actions">
              <Link href={menuHref} className="home-button">Explore the menu<SiteIcon name="arrow" /></Link>
              <DeliveryButton className="home-button is-outline">Order delivery<SiteIcon name="delivery" /></DeliveryButton>
            </div>
          </div>
          <a href="#locations" className="home-scroll-link"><span>Find your neighborhood</span><SiteIcon name="arrow" /></a>
        </div>
      </section>

      <div className="home-welcome-line"><span>Handmade tortillas</span><span>Burgundy pepper tri-tip</span><span>Four San Diego shops</span></div>

      <section className="home-menu home-section-shell" aria-labelledby="home-menu-title">
        <div className="home-menu-intro" data-reveal>
          <div>
            <p className="home-kicker">From our kitchen</p>
            <h2 id="home-menu-title">Simple ingredients.<br /><em>Something special.</em></h2>
          </div>
          <div className="home-menu-intro-copy">
            <p>Handmade tortillas, fresh salsa, and our signature burgundy pepper tri-tip. A few of the favorites that bring us together.</p>
            <Link href={menuHref} className="home-text-link">Explore the menu<SiteIcon name="arrow" /></Link>
          </div>
        </div>
        <div className="home-dish-grid">
          {signatureDishes.map((dish, index) => (
            <figure key={dish.src} className="home-dish" data-reveal>
              <Link href={menuHref} className="home-dish-photo" aria-label={`Explore the menu for ${dish.name.toLowerCase()}`}>
                <Image src={dish.src} alt={dish.alt} fill sizes={index === 0 ? "(min-width: 800px) 55vw, 100vw" : "(min-width: 800px) 40vw, 100vw"} />
              </Link>
              <figcaption className="home-dish-caption">
                <span className="home-dish-number">0{index + 1}</span>
                <div><h3>{dish.name}</h3><p>{dish.description}</p></div>
                <Link href={menuHref} aria-label={`View menu for ${dish.name.toLowerCase()}`}><SiteIcon name="arrow" /></Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="locations" className="home-shops home-section-shell" aria-labelledby="home-locations-title">
        <div className="home-section-intro" data-reveal>
          <p className="home-kicker">Four locations. One San Diego.</p>
          <h2 id="home-locations-title">See you <em>at Prime.</em></h2>
          <p>Find your neighborhood shop for local menus, hours, and directions.</p>
        </div>
        <div className="home-shop-grid">
          {locations.map((location) => (
            <article key={location.slug} className="home-shop" data-reveal>
              <div className="home-shop-heading">
                <LocationOpenBadge slug={location.slug} />
                {shoppingLocation?.slug === location.slug && <span className="home-selected-store">Your store</span>}
              </div>
              <h3><Link href={`/locations/${location.slug}`}>{location.name}</Link></h3>
              <p className="home-shop-address">{location.address}</p>
              <p className="home-shop-hours">{location.hours}</p>
              <div className="home-shop-links">
                <Link href={getMenuHref(location)} aria-label={`View ${location.name} menu`}>Menu<SiteIcon name="arrow" /></Link>
                {location.phone && <a href={`tel:${location.phone}`} aria-label={`Call ${location.name}`}><SiteIcon name="phone" />Call</a>}
                <a href={getGoogleMapsDirectionsUrl(location)} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${location.name}`}><SiteIcon name="pin" />Directions</a>
              </div>
              <DeliveryButton locationSlug={location.slug} className="home-shop-delivery">Order delivery<SiteIcon name="arrow" /></DeliveryButton>
            </article>
          ))}
        </div>
        <p className="home-hours-note">Hours may vary on holidays. Call your shop before visiting.</p>
      </section>

      <section id="delivery" className="home-ordering" aria-labelledby="home-delivery-title">
        <div className="home-section-shell home-ordering-inner" data-reveal>
          <div>
            <p className="home-kicker">Make it Prime</p>
            <h2 id="home-delivery-title">At our place.<br /><em>Or yours.</em></h2>
          </div>
          <div className="home-ordering-copy">
            <p>Pick up from your neighborhood shop, or let your favorite delivery service bring Prime to you.</p>
            <div className="home-ordering-actions">
              {shoppingLocation?.toastUrl
                ? <a href={shoppingLocation.toastUrl} target="_blank" rel="noopener noreferrer" className="home-button">Order pickup<SiteIcon name="bag" /></a>
                : <Link href="/order-online" className="home-button">Order pickup<SiteIcon name="bag" /></Link>}
              <DeliveryButton className="home-button is-outline">Order delivery<SiteIcon name="delivery" /></DeliveryButton>
            </div>
            <p className="home-ordering-note">Availability depends on your address and the shop’s hours.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
