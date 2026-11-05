"use client";

import { useId, useRef, type ReactElement } from "react";

import DeliveryButton from "@/components/DeliveryButton";
import SiteIcon from "@/components/SiteIcon";
import { locations } from "@/data/locations";
import { setStoredShoppingLocationSlug } from "@/lib/shopping-location";
import { useShoppingLocation } from "@/lib/use-shopping-location";

import styles from "./QuickOrderPanel.module.css";

export default function QuickOrderPanel(): ReactElement {
  const shoppingLocation = useShoppingLocation();
  const locationId = useId();
  const locationSelectRef = useRef<HTMLSelectElement>(null);

  return (
    <div className={styles.panel} role="group" aria-label="Order online">
      <div className={styles.location}>
        <label htmlFor={locationId}>Your location</label>
        <select
          ref={locationSelectRef}
          id={locationId}
          value={shoppingLocation?.slug ?? ""}
          onChange={(event) => {
            const location = locations.find((shop) => shop.slug === event.target.value);
            if (location) setStoredShoppingLocationSlug(location.slug);
          }}
        >
          <option value="" disabled>Choose a location</option>
          {locations.map((location) => (
            <option key={location.slug} value={location.slug}>{location.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.actions}>
        {shoppingLocation?.toastUrl ? (
          <a href={shoppingLocation.toastUrl} className={styles.pickup} aria-label={`Order pickup from ${shoppingLocation.name}`}>
            Order pickup<SiteIcon name="bag" />
          </a>
        ) : (
          <button type="button" className={styles.pickup} onClick={() => locationSelectRef.current?.focus()}>
            Order pickup<SiteIcon name="bag" />
          </button>
        )}
        <DeliveryButton locationSlug={shoppingLocation?.slug} className={styles.delivery}>
          Order delivery<SiteIcon name="delivery" />
        </DeliveryButton>
      </div>
    </div>
  );
}
