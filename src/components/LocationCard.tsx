import Link from "next/link";

import type { Location } from "@/data/locations";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";

type Props = {
  location: Location;
};

export default function LocationCard({ location }: Props) {
  const directionsUrl = getGoogleMapsDirectionsUrl({
    address: location.address,
    placeId: location.placeId,
    googleMapsUrl: location.googleMapsUrl,
  });
  const quickOrderUrl =
    location.toastUrl ?? location.doorDash ?? location.grubHub ?? location.uberEats;

  return (
    <article className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="space-y-4 p-5 text-neutral-950 sm:p-6">
        <h2 className="font-display text-xl text-neutral-950 sm:text-2xl">{location.name}</h2>

        <p className="text-sm text-neutral-600">{location.address}</p>
        <p className="text-sm text-neutral-600">{location.hours}</p>

        {location.phone && (
          <a href={`tel:${location.phone}`} className="inline-flex text-sm font-semibold text-brand-green hover:text-neutral-950">
            Call {location.phone}
          </a>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-btn-directions flex-1 px-4 py-2 text-sm sm:flex-none"
          >
            Get Directions
          </a>
          {quickOrderUrl && (
            <a
              href={quickOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-btn flex-1 px-4 py-2 text-sm sm:flex-none"
            >
              Order Online
            </a>
          )}
          <Link
            href={`/locations/${location.slug}`}
            className="brand-btn-muted w-full px-4 py-2 text-sm sm:w-auto"
          >
            Location Details
          </Link>
        </div>
      </div>
    </article>
  );
}
