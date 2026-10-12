import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";

import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteIcon from "@/components/SiteIcon";
import type { Location } from "@/data/locations";
import { getLocationFoodPhoto } from "@/data/site-content";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { getMenuHref } from "@/lib/menu-link";

type Props = { location: Location };

export default function LocationCard({ location }: Props): ReactElement {
  const directionsUrl = getGoogleMapsDirectionsUrl(location);
  const photo = getLocationFoodPhoto(location.slug);

  return (
    <article className="location-card surface-panel">
      <Link href={`/locations/${location.slug}`} className="location-card-photo" aria-label={`Visit ${location.name}`}>
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 50vw, 100vw" />
        <span className="location-photo-label">From our kitchen</span>
      </Link>
      <div className="location-card-body">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl"><Link href={`/locations/${location.slug}`}>{location.name}</Link></h2>
          <LocationOpenBadge slug={location.slug} />
        </div>
        <p className="mt-4 text-sm text-neutral-600">{location.address}</p>
        <p className="mt-2 text-sm text-neutral-600">{location.hours}</p>
        <div className="location-card-actions">
          <Link href={getMenuHref(location)} className="brand-btn px-5 py-3 text-sm">View menu<SiteIcon name="arrow" /></Link>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="brand-btn-muted px-5 py-3 text-sm" aria-label={`Directions to ${location.name} (opens in a new tab)`}>Directions<SiteIcon name="pin" /></a>
        </div>
        <div className="location-card-details">
          {location.phone && <a href={`tel:${location.phone}`} className="text-link" aria-label={`Call ${location.name} at ${location.phone}`}><SiteIcon name="phone" />{location.phone}</a>}
          <Link href={`/locations/${location.slug}`} className="text-link">Shop details<SiteIcon name="arrow" /></Link>
        </div>
      </div>
    </article>
  );
}
