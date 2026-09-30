"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactElement } from "react";

import SiteIcon from "@/components/SiteIcon";
import { heroFoodPhotos, type HeroPhoto } from "@/data/hero-photos";
import type { Location } from "@/data/locations";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void): () => void {
  const preference = window.matchMedia(reducedMotionQuery);
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return true;
}

type Props = {
  location?: Location;
};

export default function HeroPhotoCarousel({ location }: Props): ReactElement {
  const photos: HeroPhoto[] = heroFoodPhotos;
  const [activeIndex, setActiveIndex] = useState(0);
  const [playback, setPlayback] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const isPlaying = playback ?? !reducedMotion;
  const photoCount = photos.length;
  const currentIndex = activeIndex % photoCount;

  useEffect(() => {
    if (!isPlaying || isHovered) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveIndex((index) => (index + 1) % photoCount);
      }
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, isHovered, photoCount]);

  const movePhoto = (direction: number): void => {
    setPlayback(false);
    setActiveIndex((index) => (index + direction + photoCount) % photoCount);
  };

  return (
    <div
      className="prime-hero-media hero-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={location ? `${location.name} food photos` : "Prime Tacos food photos"}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setIsHovered(false); }}
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) {
          setPlayback(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          movePhoto(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onTouchStart={(event) => {
        if (event.touches.length !== 1 || (event.target instanceof Element && event.target.closest("button"))) {
          touchStartRef.current = null;
          return;
        }
        const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        setPlayback(false);
      }}
      onTouchEnd={(event) => {
        const start = touchStartRef.current;
        const touch = event.changedTouches[0];
        touchStartRef.current = null;
        if (!start) {
          return;
        }
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
          movePhoto(deltaX < 0 ? 1 : -1);
        }
      }}
      onTouchCancel={() => { touchStartRef.current = null; }}
    >
      <div aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">
        {photos.map((photo, index) => (
          <div key={photo.src} className={`hero-photo-slide ${index === currentIndex ? "is-active" : ""}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${photoCount}`} aria-hidden={index !== currentIndex}>
            <Image src={photo.src} alt={index === currentIndex ? photo.alt : ""} fill priority={index === 0} sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
          </div>
        ))}
      </div>
      <span className="hero-photo-label">{photos[currentIndex].label}</span>
      <div className="hero-photo-controls">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => movePhoto(-1)} onFocus={() => setPlayback(false)} className="hero-photo-button" aria-label="Show previous photo">
            <SiteIcon name="arrow" className="h-5 w-5 rotate-180" />
          </button>
          <span className="min-w-10 text-center text-xs font-bold text-white" aria-label={`Photo ${currentIndex + 1} of ${photoCount}`}>{currentIndex + 1} / {photoCount}</span>
          <button type="button" onClick={() => movePhoto(1)} onFocus={() => setPlayback(false)} className="hero-photo-button" aria-label="Show next photo">
            <SiteIcon name="arrow" />
          </button>
        </div>
        <button type="button" onClick={() => setPlayback(!isPlaying)} className="hero-photo-button gap-2 px-3 text-xs font-bold" aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}>
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d={isPlaying ? "M5 4h3v12H5V4Zm7 0h3v12h-3V4Z" : "m6 3 11 7-11 7V3Z"} />
          </svg>
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
