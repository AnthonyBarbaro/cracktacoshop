"use client";

import { useRef, useState, useSyncExternalStore, type ReactElement } from "react";

import GoogleMapEmbed from "@/components/GoogleMapEmbed";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteIcon from "@/components/SiteIcon";
import type { Location } from "@/data/locations";
import {
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
} from "@/lib/google-maps";
import {
  getShoppingLocationSlugServerSnapshot,
  getShoppingLocationSlugSnapshot,
  setStoredShoppingLocationSlug,
  subscribeToShoppingLocationChanges,
} from "@/lib/shopping-location";

import styles from "./LocationsMapPanel.module.css";

type Props = {
  locations: Location[];
};

export default function LocationsMapPanel({ locations }: Props): ReactElement | null {
  const [isListOpen, setIsListOpen] = useState(false);
  const listToggleRef = useRef<HTMLButtonElement>(null);
  const selectedSlug = useSyncExternalStore(
    subscribeToShoppingLocationChanges,
    getShoppingLocationSlugSnapshot,
    getShoppingLocationSlugServerSnapshot,
  );
  const activeLocation =
    locations.find((location) => location.slug === selectedSlug) ?? locations[0];

  if (!activeLocation) {
    return null;
  }

  const embedSrc = getGoogleMapsEmbedUrl({
    address: activeLocation.address,
    placeId: activeLocation.placeId,
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim(),
  });

  const closeList = (): void => {
    setIsListOpen(false);
    listToggleRef.current?.focus();
  };

  const selectLocation = (slug: string): void => {
    setStoredShoppingLocationSlug(slug);
    if (isListOpen) {
      closeList();
    }
  };

  return (
    <div className={styles.panel} data-list-open={isListOpen}>
      <button
        ref={listToggleRef}
        type="button"
        className={styles.listToggle}
        aria-expanded={isListOpen}
        aria-controls="locations-list"
        onClick={() => setIsListOpen(!isListOpen)}
      >
        <SiteIcon name={isListOpen ? "close" : "menu"} />
        {isListOpen ? "Hide locations" : "Show locations"}
      </button>
      <section
        id="locations-list"
        className={styles.listPanel}
        aria-labelledby="locations-list-title"
        onBlur={(event) => {
          if (
            isListOpen
            && !event.currentTarget.contains(event.relatedTarget)
            && event.relatedTarget !== listToggleRef.current
          ) {
            setIsListOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isListOpen) {
            event.preventDefault();
            closeList();
          }
        }}
      >
        <div className={styles.listHeader}>
          <h2 id="locations-list-title" className={styles.title}>Our locations</h2>
          <span className={styles.shopCount}>{locations.length} shops</span>
        </div>
        <div className={styles.list} role="region" aria-label="Choose a Prime Tacos shop" tabIndex={0}>
          {locations.map((location, index) => {
            const isSelected = location.slug === activeLocation.slug;

            return (
              <article key={location.slug} className={styles.location} data-selected={isSelected}>
                <h3>
                  <button
                    type="button"
                    className={styles.selectLocation}
                    aria-label={`Show ${location.name} on the map`}
                    aria-pressed={isSelected}
                    aria-controls="locations-map"
                    onClick={() => selectLocation(location.slug)}
                  >
                    <span className={styles.number} aria-hidden="true">{index + 1}</span>
                    {location.name}
                  </button>
                </h3>
                <div className={styles.details}>
                  <p>{location.address}</p>
                  <p>{location.hours}</p>
                  {location.phone && <a href={`tel:${location.phone}`}>{location.phone}</a>}
                </div>
                <div className={styles.actions}>
                  {location.toastUrl && (
                    <a
                      href={location.toastUrl}
                      className={styles.order}
                      aria-label={`Order online from ${location.name}`}
                    >
                      Order online
                    </a>
                  )}
                  <a
                    href={getGoogleMapsDirectionsUrl(location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.directions}
                    aria-label={`Directions to ${location.name} (opens in a new tab)`}
                  >
                    Directions
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <div id="locations-map" className={styles.map}>
        <div className={styles.mapCanvas}>
          <GoogleMapEmbed title={`${activeLocation.name} map`} src={embedSrc} allowFullScreen />
        </div>
        <section className={styles.selectedCard} aria-labelledby="selected-location-name">
          <div className={styles.selectedHeading}>
            <h2 id="selected-location-name">{activeLocation.name}</h2>
            <LocationOpenBadge slug={activeLocation.slug} />
          </div>
          <p className={styles.selectedAddress}>{activeLocation.address}</p>
          <p className={styles.selectedHours}>{activeLocation.hours}</p>
          <div className={styles.selectedActions}>
            {activeLocation.toastUrl && (
              <a href={activeLocation.toastUrl} className={styles.order} aria-label={`Order online from ${activeLocation.name}`}>
                <SiteIcon name="bag" />Order online
              </a>
            )}
            <a
              href={getGoogleMapsDirectionsUrl(activeLocation)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.directions}
              aria-label={`Directions to ${activeLocation.name} (opens in a new tab)`}
            >
              <SiteIcon name="pin" />Directions
            </a>
            {activeLocation.phone && (
              <a href={`tel:${activeLocation.phone}`} className={styles.call} aria-label={`Call ${activeLocation.name}`}>
                <SiteIcon name="phone" />Call
              </a>
            )}
          </div>
        </section>
        <p className="sr-only" aria-live="polite">Showing {activeLocation.name} on the map.</p>
      </div>
    </div>
  );
}
