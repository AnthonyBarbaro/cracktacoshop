"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { locations, type Location } from "@/data/locations";
import {
  getShoppingLocationSlugServerSnapshot,
  getShoppingLocationSlugSnapshot,
  subscribeToShoppingLocationChanges,
} from "@/lib/shopping-location";

export function useShoppingLocation(): Location | undefined {
  const pathname = usePathname();
  const storedSlug = useSyncExternalStore(
    subscribeToShoppingLocationChanges,
    getShoppingLocationSlugSnapshot,
    getShoppingLocationSlugServerSnapshot,
  );
  const segments = pathname.split("/").filter(Boolean);
  const routeSlug = segments[0] === "locations" || (segments[0] === "menu" && segments[2] === "embed")
    ? segments[1]
    : undefined;

  return locations.find((location) => location.slug === (routeSlug ?? storedSlug));
}
