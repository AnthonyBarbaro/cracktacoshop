"use client";

import Script from "next/script";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactElement } from "react";

import type { InstagramReel } from "@/data/instagram-reels";
import {
  getCookiePreferenceServerSnapshot,
  getCookiePreferenceSnapshot,
  setCookiePreference,
  subscribeToCookiePreferenceChanges,
} from "@/lib/cookie-preferences";

import styles from "./InstagramReelsSection.module.css";

type InstagramWindow = Window & { instgrm?: { Embeds?: { process: () => void } } };

function processEmbed(): void {
  if (getCookiePreferenceSnapshot() !== "enabled") return;
  (window as InstagramWindow).instgrm?.Embeds?.process();
}

function EnabledReel({ reel }: { reel: InstagramReel }): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Instagram owns this subtree after processing the blockquote.
    const quote = document.createElement("blockquote");
    quote.className = "instagram-media";
    quote.dataset.instgrmPermalink = reel.href;
    quote.dataset.instgrmVersion = "14";
    const link = document.createElement("a");
    link.href = reel.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `Watch ${reel.title} on Instagram`;
    quote.append(link);
    container.append(quote);
    processEmbed();

    return () => container.replaceChildren();
  }, [reel.href, reel.title]);

  return (
    <>
      <div ref={containerRef} className={styles.embed} />
      <Script id="prime-instagram-embed" src="https://www.instagram.com/embed.js" strategy="afterInteractive" onReady={processEmbed} onError={() => setFailed(true)} />
      <p className={styles.embedHint} role={failed ? "status" : undefined}>
        {failed ? "Instagram couldn’t load. Use the link below to watch." : "You can also watch this reel on Instagram using the link below."}
      </p>
    </>
  );
}

export default function InstagramReelEmbed({ reel }: { reel: InstagramReel }): ReactElement {
  const preference = useSyncExternalStore(subscribeToCookiePreferenceChanges, getCookiePreferenceSnapshot, getCookiePreferenceServerSnapshot);

  if (preference !== "enabled") {
    return (
      <div className={styles.consent}>
        <p>Allow optional cookies to watch Instagram videos here.</p>
        <button type="button" onClick={(event) => {
          if (document.activeElement === event.currentTarget) {
            const dialog = event.currentTarget.closest("dialog");
            const close = dialog?.querySelector<HTMLButtonElement>("[data-reel-close]");
            (close ?? dialog)?.focus({ preventScroll: true });
          }
          setCookiePreference("enabled");
        }} className={styles.allowButton}>Allow optional cookies</button>
        <p className={styles.consentHint}>You can also use the Instagram link below.</p>
      </div>
    );
  }

  return <EnabledReel key={reel.id} reel={reel} />;
}
