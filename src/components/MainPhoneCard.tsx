"use client";

import { usePathname } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
import {
  getShoppingLocationSlugServerSnapshot,
  getShoppingLocationSlugSnapshot,
  subscribeToShoppingLocationChanges,
} from "@/lib/shopping-location";

function getRouteLocationSlug(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "locations" && segments[1]) {
    return segments[1];
  }

  if (segments[0] === "menu" && segments[1] && segments[2] === "embed") {
    return segments[1];
  }

  return undefined;
}

export default function MainPhoneCard() {
  const pathname = usePathname();
  const routeLocationSlug = getRouteLocationSlug(pathname);
  const storedShoppingSlug = useSyncExternalStore(
    subscribeToShoppingLocationChanges,
    getShoppingLocationSlugSnapshot,
    getShoppingLocationSlugServerSnapshot,
  );

  const fallbackLocation = useMemo(
    () => locations.find((location) => location.phone === site.phone) ?? locations[0],
    [],
  );
  const activeSlug = routeLocationSlug ?? storedShoppingSlug;
  const selectedLocation = useMemo(
    () => locations.find((location) => location.slug === activeSlug),
    [activeSlug],
  );
  const activeLocation = selectedLocation ?? fallbackLocation;
  const phone = activeLocation?.phone ?? site.phone;

  return (
    <a href={`tel:${phone}`} className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-brand-green">Call us</p>
      <p className="mt-2 text-xl font-semibold text-neutral-950">{phone}</p>
      <p className="mt-1 text-xs text-neutral-600">
        {activeLocation ? activeLocation.name : "Your selected location"}
      </p>
    </a>
  );
}
