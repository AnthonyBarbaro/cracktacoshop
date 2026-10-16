"use client";

import { useId, useRef, type ReactElement } from "react";

import DeliveryButton from "@/components/DeliveryButton";
import SiteIcon from "@/components/SiteIcon";
import { locations } from "@/data/locations";
import { setStoredShoppingLocationSlug } from "@/lib/shopping-location";
import { useShoppingLocation } from "@/lib/use-shopping-location";

import styles from "./OrderOnlineSection.module.css";

type Props = {
  headingLevel?: 1 | 2;
  id?: string;
  reveal?: boolean;
};

export default function OrderOnlineSection({ headingLevel = 2, id, reveal = false }: Props): ReactElement {
  const shoppingLocation = useShoppingLocation();
  const titleId = useId();
  const locationId = useId();
  const locationSelectRef = useRef<HTMLSelectElement>(null);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section id={id} className="home-ordering" aria-labelledby={titleId}>
      <div className="home-section-shell home-ordering-inner" data-reveal={reveal || undefined}>
        <div>
          <p className="home-kicker">Make it Prime</p>
          <Heading id={titleId} className={styles.heading}>At our place.<br /><em>Or yours.</em></Heading>
        </div>
        <div className="home-ordering-copy">
          <p>Pickup from your shop. Delivery to your door.</p>
          <div className={styles.locationPicker}>
            <label htmlFor={locationId}>Your location</label>
            <select
              ref={locationSelectRef}
              id={locationId}
              value={shoppingLocation?.slug ?? ""}
              onChange={(event) => {
                const location = locations.find((shop) => shop.slug === event.target.value);
                if (location) setStoredShoppingLocationSlug(location.slug);
              }}
              className="brand-input"
            >
              <option value="" disabled>Choose a location</option>
              {locations.map((location) => (
                <option key={location.slug} value={location.slug}>{location.name}</option>
              ))}
            </select>
          </div>
          <div className="home-ordering-actions">
            {shoppingLocation?.toastUrl
              ? <a href={shoppingLocation.toastUrl} target="_blank" rel="noopener noreferrer" className="home-button">Order pickup<SiteIcon name="bag" /></a>
              : <button type="button" className="home-button" onClick={() => locationSelectRef.current?.focus()}>Order pickup<SiteIcon name="bag" /></button>}
            <DeliveryButton locationSlug={shoppingLocation?.slug} className="home-button is-outline">Order delivery<SiteIcon name="delivery" /></DeliveryButton>
          </div>
          <p className="home-ordering-note">Availability depends on your address and the shop’s hours.</p>
        </div>
      </div>
    </section>
  );
}
