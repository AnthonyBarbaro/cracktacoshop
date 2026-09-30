"use client";

import { useState, type ReactElement } from "react";

import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteIcon from "@/components/SiteIcon";
import StoreLocationSearch from "@/components/StoreLocationSearch";
import { locations } from "@/data/locations";

type Props = {
  onSelectStore: (slug: string) => void;
  onBrowse: () => void;
};

export default function StoreWelcome({ onSelectStore, onBrowse }: Props): ReactElement {
  const [nearestLocationSlug, setNearestLocationSlug] = useState<string | null>(null);
  const orderedLocations = [...locations].sort((first, second) =>
    Number(second.slug === nearestLocationSlug) - Number(first.slug === nearestLocationSlug)
  );

  return (
    <div className="store-welcome">
      <div className="store-welcome-intro">
        <p className="eyebrow">Welcome to Prime Taco Shop</p>
        <h2 id="mobile-menu-title" tabIndex={-1}>Find your Prime<span>.</span></h2>
        <p id="store-picker-description">Choose your store for local menus, hours, and ordering.</p>
      </div>

      <div className="store-welcome-content">
        <details className="store-welcome-finder">
          <summary>
            <SiteIcon name="pin" className="h-4 w-4" />
            Find a store near me
            <span className="store-welcome-finder-icon" aria-hidden="true" />
          </summary>
          <StoreLocationSearch onNearestLocation={setNearestLocationSlug} />
        </details>

        <div className="store-welcome-grid">
          {orderedLocations.map((location) => {
            const isNearest = location.slug === nearestLocationSlug;

            return (
              <button
                key={location.slug}
                type="button"
                onClick={() => onSelectStore(location.slug)}
                className={`store-welcome-card${isNearest ? " is-nearest" : ""}`}
                aria-label={`Choose ${location.name}`}
                aria-describedby={`welcome-${location.slug}-details`}
              >
                <span className="store-welcome-card-body">
                  {isNearest && <span className="mb-2 text-xs font-semibold text-brand-green">Closest to you</span>}
                  <span className="store-welcome-name">{location.name}</span>
                  <span id={`welcome-${location.slug}-details`} className="store-welcome-details">
                    <span>{location.address}</span>
                    <span className="store-welcome-hours">{location.hours}</span>
                  </span>
                  <span className="store-welcome-status"><LocationOpenBadge slug={location.slug} /></span>
                  <span className="store-welcome-select">Choose this store<SiteIcon name="arrow" className="h-4 w-4" /></span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="store-welcome-footer">
          <p>You can switch locations anytime.</p>
          <button type="button" onClick={onBrowse} className="store-welcome-browse">Just browsing<SiteIcon name="arrow" className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
