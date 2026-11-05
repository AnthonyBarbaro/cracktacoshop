"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactElement } from "react";

import DeliveryButton from "@/components/DeliveryButton";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import FoodPhoto from "@/components/FoodPhoto";
import FoodPhotoRail from "@/components/FoodPhotoRail";
import HomeHeroSlideshow from "@/components/HomeHeroSlideshow";
import SiteIcon from "@/components/SiteIcon";
import { locations } from "@/data/locations";
import { foodPhotos } from "@/data/food-photos";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { setStoredShoppingLocationSlug } from "@/lib/shopping-location";
import { useShoppingLocation } from "@/lib/use-shopping-location";

import styles from "./HomeContent.module.css";

const cateringPhoto = foodPhotos.find((photo) => photo.id === "takeout-spread") ?? foodPhotos[0];

export default function HomeContent(): ReactElement {
  const shoppingLocation = useShoppingLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
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

    return () => {
      observer.disconnect();
      main.classList.remove("motion-ready");
    };
  }, []);

  return (
    <main ref={mainRef} id="main-content" className="home-editorial">
      <HomeHeroSlideshow orderHref={shoppingLocation?.toastUrl ?? "/order-online"} />

      <section id="locations" className="home-shops home-section-shell" aria-labelledby="home-locations-title">
        <div className="home-section-intro" data-reveal>
          <p className="home-kicker">Four locations. One San Diego.</p>
          <h2 id="home-locations-title">See you <em>at Prime.</em></h2>
          <p>Find your neighborhood shop for local menus, hours, and directions.</p>
        </div>
        <div className="home-shop-grid">
          {locations.map((location) => {
            const isSelected = shoppingLocation?.slug === location.slug;
            return (
              <article key={location.slug} className="home-shop" data-selected={isSelected} data-reveal>
                <div className="home-shop-heading">
                  <LocationOpenBadge slug={location.slug} />
                  {isSelected ? <span className="home-selected-store">Your store</span> : <span className="home-select-store">Select store</span>}
                </div>
                <h3><button type="button" className="home-shop-select" aria-pressed={isSelected} aria-label={isSelected ? `Selected store: ${location.name}` : `Select ${location.name} as your store`} onClick={() => setStoredShoppingLocationSlug(location.slug)}>{location.name}</button></h3>
                <p className="home-shop-address">{location.address}</p>
                <p className="home-shop-hours">{location.hours}</p>
                <div className="home-shop-links">
                  {location.phone && <a href={`tel:${location.phone}`} aria-label={`Call ${location.name}`}><SiteIcon name="phone" />Call</a>}
                  <a href={getGoogleMapsDirectionsUrl(location)} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${location.name}`}><SiteIcon name="pin" />Directions</a>
                </div>
                {location.toastUrl && <a href={location.toastUrl} className={styles.orderLink}>Order pickup<SiteIcon name="bag" /></a>}
                <DeliveryButton locationSlug={location.slug} className="home-shop-delivery">Order delivery<SiteIcon name="delivery" /></DeliveryButton>
              </article>
            );
          })}
        </div>
      </section>

      <div className={styles.foodSection} data-reveal>
        <FoodPhotoRail />
      </div>

      <section id="catering" className={styles.cateringSection} aria-labelledby="home-catering-title">
        <div className={styles.cateringInner} data-reveal>
          <FoodPhoto photo={cateringPhoto} sizes="(max-width: 799px) 100vw, 480px" className={styles.cateringPhoto} />
          <div className={styles.cateringCopy}>
            <p className="home-kicker">Catering</p>
            <h2 id="home-catering-title" className={styles.cateringTitle}>Tacos for the<br />whole crew.</h2>
            <p className={styles.cateringDescription}>Planning a party or a team lunch? Call us to plan your order.</p>
            <Link href="/catering" className={styles.cateringLink}>Explore catering<SiteIcon name="arrow" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
