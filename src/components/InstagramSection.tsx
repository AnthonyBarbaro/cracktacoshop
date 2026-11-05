"use client";

import Script from "next/script";
import Image from "next/image";
import { useSyncExternalStore, type ReactNode } from "react";

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
const profilePhotos = foodShowcase.slice(0, 6);

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

function InstagramPreview(): ReactNode {
  return (
    <>
      <a
        href={site.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit @${instagramHandle} on Instagram (opens in a new tab)`}
        className={styles.profileHeader}
      >
        <span className={styles.avatar}>
          <Image src="/newlogo.png" alt="" width={88} height={88} className={styles.avatarImage} />
        </span>
        <span className={styles.profileDetails}>
          <strong className={styles.handle}>{instagramHandle}</strong>
          <span className={styles.profileName}>{site.name}</span>
          <span className={styles.profileBio}>{site.tagline}</span>
        </span>
        <span className={styles.profileIcon}><InstagramIcon /></span>
      </a>
      <div className={styles.photos}>
        {profilePhotos.map((photo) => (
          <a
            key={photo.src}
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${photo.alt}. Visit @${instagramHandle} on Instagram (opens in a new tab).`}
            className={styles.photo}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 579px) calc((100vw - 2.5rem) / 3), 180px"
              className={styles.photoImage}
            />
          </a>
        ))}
      </div>
      <p className={styles.previewCaption}>A taste of the Prime kitchen.</p>
    </>
  );
}

function InstagramEmbed(): ReactNode {
  return (
    <div className={styles.embed}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={site.instagram}
        data-instgrm-version="14"
      >
        <InstagramPreview />
      </blockquote>
      <Script
        id="prime-instagram-embed"
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
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
        <svg className={styles.flourish} viewBox="0 0 64 10" fill="none" aria-hidden="true">
          <path d="M1 5C11-3 21 13 32 5S53 13 63 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div className={styles.card}>
          {cookiePreference === "enabled" ? <InstagramEmbed /> : <InstagramPreview />}
        </div>
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
