"use client";

import { useSyncExternalStore, type ReactElement } from "react";

import GoogleMapEmbed from "@/components/GoogleMapEmbed";
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

  return (
    <div className={styles.panel}>
      <div className={styles.listPanel}>
        <h2 className={styles.title}>Locations</h2>
        <div className={styles.list}>
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
                    onClick={() => setStoredShoppingLocationSlug(location.slug)}
                  >
                    <span className={styles.number} aria-hidden="true">{index + 1}</span>
                    {location.name.toUpperCase()}
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.order}
                      aria-label={`Order online from ${location.name} (opens in a new tab)`}
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
      </div>
      <div id="locations-map" className={styles.map}>
        <GoogleMapEmbed title={`${activeLocation.name} map`} src={embedSrc} allowFullScreen />
        <p className="sr-only" aria-live="polite">Showing {activeLocation.name} on the map.</p>
      </div>
    </div>
  );
}
