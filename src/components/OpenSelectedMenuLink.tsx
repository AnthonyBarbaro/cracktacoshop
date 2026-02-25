"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { locations } from "@/data/locations";
import {
  getShoppingLocationSlugServerSnapshot,
  getShoppingLocationSlugSnapshot,
  subscribeToShoppingLocationChanges,
} from "@/lib/shopping-location";

type Props = {
  className?: string;
  fallbackSlug?: string;
  label?: string;
};

export default function OpenSelectedMenuLink({
  className,
  fallbackSlug = "mission-valley",
  label = "Open Full Menu",
}: Props) {
  const selectedSlug = useSyncExternalStore(
    subscribeToShoppingLocationChanges,
    getShoppingLocationSlugSnapshot,
    getShoppingLocationSlugServerSnapshot,
  );

  const href = useMemo(() => {
    const fallback = locations.some((location) => location.slug === fallbackSlug)
      ? fallbackSlug
      : locations[0]?.slug;
    const resolvedSlug = locations.some((location) => location.slug === selectedSlug)
      ? selectedSlug
      : fallback;

    return resolvedSlug ? `/menu/${resolvedSlug}/embed` : "/menu";
  }, [fallbackSlug, selectedSlug]);

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
