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
    <a href={`tel:${phone}`} className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-brand-yellow">Main Phone</p>
      <p className="mt-2 text-xl font-semibold text-white">{phone}</p>
      <p className="mt-1 text-xs text-white/65">
        {activeLocation ? `Current location: ${activeLocation.name}` : "Current location selected in menu"}
      </p>
    </a>
  );
}
