"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactElement } from "react";

import DeliveryButton from "@/components/DeliveryButton";
import HomeLogoIntro from "@/components/HomeLogoIntro";
import DeliveryLinks from "@/components/DeliveryLinks";
import HomeHeroVideo from "@/components/HomeHeroVideo";
import SiteIcon from "@/components/SiteIcon";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
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
          <Image src="/images/food-3.jpg" alt="Fresh tacos with guacamole, onion, and cilantro" fill sizes="(min-width: 800px) 60vw, 100vw" priority className="home-hero-photo" />
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

      <div className="home-welcome-line"><span>Good food. Good company.</span><span>Always a good idea.</span></div>

      <section id="locations" className="home-shops home-section-shell" aria-labelledby="home-locations-title">
        <div className="home-section-intro" data-reveal>
          <p className="home-kicker">Four locations. One San Diego.</p>
          <h2 id="home-locations-title">See you <em>at Prime.</em></h2>
          <p>Stop by your neighborhood shop. We’ll take care of the tacos.</p>
        </div>
        <div className="home-shop-grid">
          {locations.map((location) => (
            <article key={location.slug} className="home-shop" data-reveal>
              <div className="home-shop-heading">
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
      </section>

      <section id="delivery" className="home-delivery" aria-labelledby="home-delivery-title">
        <div className="home-section-shell">
          <div className="home-section-intro" data-reveal>
            <p className="home-kicker">Your tacos. Your way.</p>
            <h2 id="home-delivery-title">From our kitchen<br /><em>to wherever you are.</em></h2>
            <p>Pick up at the shop or choose your favorite delivery service.</p>
          </div>
          <div className="home-delivery-list">
            {locations.map((location) => (
              <article id={`delivery-${location.slug}`} key={location.slug} className="home-delivery-row" data-reveal>
                <h3>{location.name}</h3>
                <div className="home-delivery-options">
                  {location.toastUrl && <a href={location.toastUrl} target="_blank" rel="noopener noreferrer" className="home-pickup-link" aria-label={`Order pickup from ${location.name}`}>Order pickup<SiteIcon name="bag" /></a>}
                  <DeliveryLinks location={location} className="home-provider-links" />
                </div>
              </article>
            ))}
          </div>
          <p className="home-delivery-note">Delivery availability depends on your address and the shop’s hours.</p>
        </div>
      </section>

      <section className="home-kitchen home-section-shell" aria-labelledby="home-kitchen-title">
        <div className="home-kitchen-copy" data-reveal>
          <p className="home-kicker">A little more Prime</p>
          <h2 id="home-kitchen-title">Made with care.<br /><em>Gone in a few bites.</em></h2>
          <p>Fresh salsa, handmade tortillas, and our signature burgundy pepper tri-tip. The good stuff, made for everyday.</p>
          <Link href="/our-story" className="home-text-link">Our story<SiteIcon name="arrow" /></Link>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="home-text-link">Follow along on Instagram<SiteIcon name="arrow" /></a>
        </div>
        <div className="home-kitchen-film" data-reveal>
          <HomeHeroVideo />
          <p>A little look inside the kitchen.</p>
        </div>
      </section>
    </main>
  );
}
