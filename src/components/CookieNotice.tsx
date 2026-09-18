"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import {
  COOKIE_SETTINGS_OPEN_EVENT,
  getCookiePreferenceServerSnapshot,
  getCookiePreferenceSnapshot,
  setCookiePreference,
  subscribeToCookiePreferenceChanges,
  type CookiePreference,
} from "@/lib/cookie-preferences";

export default function CookieNotice(): ReactNode {
  const preference = useSyncExternalStore(
    subscribeToCookiePreferenceChanges,
    getCookiePreferenceSnapshot,
    getCookiePreferenceServerSnapshot,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const noticeRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleOpen = (): void => {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setSettingsOpen(true);
    };
    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (settingsOpen) {
      noticeRef.current?.focus({ preventScroll: true });
    }
  }, [settingsOpen]);

  const choosePreference = (choice: Exclude<CookiePreference, "unset">): void => {
    setCookiePreference(choice);
    setSettingsOpen(false);
    previousFocusRef.current?.focus({ preventScroll: true });
  };

  if (preference !== "unset" && !settingsOpen) {
    return null;
  }

  return (
    <section ref={noticeRef} tabIndex={-1} className="cookie-notice" aria-labelledby="cookie-notice-title">
      <div>
        <h2 id="cookie-notice-title">Cookies &amp; preferences</h2>
        <p>Allow saved stores and Google Maps. Your choice is always saved.</p>
      </div>
      <div className="cookie-notice-actions">
        <button className="cookie-notice-button" type="button" onClick={() => choosePreference("disabled")}>
          Disable cookies
        </button>
        <button className="cookie-notice-button is-accept" type="button" onClick={() => choosePreference("enabled")}>
          Allow cookies
        </button>
      </div>
    </section>
  );
}
