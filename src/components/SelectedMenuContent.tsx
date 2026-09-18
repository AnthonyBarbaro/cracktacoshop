"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

import { useShoppingLocation } from "@/lib/use-shopping-location";

const subscribeToHydration = (): (() => void) => () => {};
const getClientSnapshot = (): boolean => true;
const getServerSnapshot = (): boolean => false;

type Props = {
  children: ReactNode;
};

export default function SelectedMenuContent({ children }: Props): ReactNode {
  const router = useRouter();
  const location = useShoppingLocation();
  const selectedSlug = location?.slug;
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (selectedSlug) {
      router.replace(`/menu/${selectedSlug}/embed`);
    }
  }, [router, selectedSlug]);

  if (!hydrated || location) {
    return (
      <main id="main-content" className="section-shell pb-20 pt-10 sm:pt-12">
        <h1 className="font-display text-3xl text-neutral-950 sm:text-4xl">Menu</h1>
        <p role="status" className="mt-4 text-sm text-neutral-600">
          {location ? `Opening the ${location.name} menu…` : "Loading your menu…"}
        </p>
      </main>
    );
  }

  return children;
}
