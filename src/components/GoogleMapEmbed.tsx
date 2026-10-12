"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import SiteIcon from "@/components/SiteIcon";

import {
  getCookiePreferenceServerSnapshot,
  getCookiePreferenceSnapshot,
  openCookieSettings,
  subscribeToCookiePreferenceChanges,
} from "@/lib/cookie-preferences";

type Props = {
  title: string;
  src: string;
  allowFullScreen?: boolean;
};

export default function GoogleMapEmbed({ title, src, allowFullScreen }: Props): ReactNode {
  const cookiePreference = useSyncExternalStore(
    subscribeToCookiePreferenceChanges,
    getCookiePreferenceSnapshot,
    getCookiePreferenceServerSnapshot,
  );

  if (cookiePreference !== "enabled") {
    return (
      <div className="map-consent absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <SiteIcon name="pin" className="map-consent-icon" />
        <p className="max-w-xs text-sm text-neutral-600">
          Use the directions link below, or allow Google Maps in cookie settings.
        </p>
        <button
          type="button"
          className="brand-btn-muted px-4 py-2 text-sm"
          onClick={openCookieSettings}
        >
          Cookie settings
        </button>
      </div>
    );
  }

  return (
    <iframe
      title={title}
      src={src}
      className="absolute inset-0 h-full w-full"
      loading="lazy"
      allowFullScreen={allowFullScreen}
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
