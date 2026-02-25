import Image from "next/image";
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
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-2xl shadow-black/30 backdrop-blur-sm">
      <div className="relative h-52 w-full sm:h-60">
        <Image
          src={location.image}
          alt={location.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
      </div>

      <div className="space-y-4 p-5 text-white sm:p-6">
        <h3 className="font-display text-xl text-white sm:text-2xl">{location.name}</h3>

        <p className="text-sm text-white/85">{location.address}</p>
        <p className="text-sm text-white/75">{location.hours}</p>

        {location.phone && (
          <a href={`tel:${location.phone}`} className="inline-flex text-sm font-semibold text-brand-yellow hover:text-white">
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
