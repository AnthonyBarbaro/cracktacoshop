"use client";

import Script from "next/script";
import Image from "next/image";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

import { foodShowcase, site } from "@/data/site-content";
import {
  getCookiePreferenceServerSnapshot,
  getCookiePreferenceSnapshot,
  openCookieSettings,
  subscribeToCookiePreferenceChanges,
} from "@/lib/cookie-preferences";

import styles from "./InstagramSection.module.css";

type InstagramWindow = Window & {
  instgrm?: { Embeds?: { process: () => void } };
};

const instagramHandle = new URL(site.instagram).pathname.replace(/\/+$/, "").slice(1);
const profilePhotos = foodShowcase.filter((photo) => [
  "/images/food-1.jpg",
  "/images/food-3.jpg",
  "/images/food-5.jpg",
  "/images/food-6.jpg",
].includes(photo.src));

function processInstagramEmbed(): void {
  if (getCookiePreferenceSnapshot() !== "enabled") return;
  (window as InstagramWindow).instgrm?.Embeds?.process();
}

function InstagramIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function InstagramEmbed(): ReactNode {
  useEffect(processInstagramEmbed, []);

  return (
    <div className={styles.embed}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={site.instagram}
        data-instgrm-version="14"
      >
        <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={styles.profile}>
          <InstagramIcon />
          <span>View @{instagramHandle} on Instagram</span>
        </a>
      </blockquote>
      <Script
        id="prime-instagram-embed"
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={processInstagramEmbed}
        onReady={processInstagramEmbed}
      />
    </div>
  );
}

export default function InstagramSection(): ReactNode {
  const cookiePreference = useSyncExternalStore(
    subscribeToCookiePreferenceChanges,
    getCookiePreferenceSnapshot,
    getCookiePreferenceServerSnapshot,
  );

  return (
    <section className={styles.section} aria-labelledby="instagram-heading">
      <div className="section-shell">
        <p className={styles.eyebrow}>Follow along</p>
        <h2 id="instagram-heading" className={styles.heading}>Prime on Instagram</h2>
        {cookiePreference === "enabled" ? (
          <div className={styles.card}>
            <InstagramEmbed />
          </div>
        ) : (
          <div className={styles.photos}>
            {profilePhotos.map((photo) => (
              <a
                key={photo.src}
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${photo.alt}. Visit @${instagramHandle} on Instagram.`}
                className={styles.photo}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 639px) 45vw, 25vw"
                  className={styles.photoImage}
                />
              </a>
            ))}
          </div>
        )}
        <div className={styles.actions}>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={styles.follow}>
            <InstagramIcon />
            Follow @{instagramHandle}
          </a>
          {cookiePreference !== "enabled" && (
            <button type="button" className={styles.settings} onClick={openCookieSettings}>
              Cookie settings
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
