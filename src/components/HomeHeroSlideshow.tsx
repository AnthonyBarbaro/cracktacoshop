"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactElement } from "react";

import FoodPhoto from "@/components/FoodPhoto";
import HomeLogoIntro from "@/components/HomeLogoIntro";
import SiteIcon from "@/components/SiteIcon";
import { heroFoodPhotos } from "@/data/food-photos";
import { getReducedMotionServerSnapshot, getReducedMotionSnapshot, subscribeToReducedMotion } from "@/lib/accessibility-preferences";

import heroStyles from "./HomeContent.module.css";
import styles from "./HomeHeroSlideshow.module.css";

type Props = { orderHref: string };
const swipeThreshold = 45;

export default function HomeHeroSlideshow({ orderHref }: Props): ReactElement {
  const heroRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerStartRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [readyPhotos, setReadyPhotos] = useState<boolean[]>(() => heroFoodPhotos.map(() => false));
  const [playback, setPlayback] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
  const photoCount = heroFoodPhotos.length;
  const isRotating = playback && !reducedMotion && !isHovered && !isDragging && isInView && documentVisible;
  const nextPhotoReady = readyPhotos[(activeIndex + 1) % photoCount];

  useEffect(() => {
    const updateVisibility = (): void => setDocumentVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    const hero = heroRef.current;
    const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver((entries) => {
      setIsInView(entries.some((entry) => entry.isIntersecting));
    }, { threshold: 0.01 });
    if (hero && observer) observer.observe(hero);

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isRotating || !nextPhotoReady) return;
    const timeout = window.setTimeout(() => setActiveIndex((index) => (index + 1) % photoCount), 7000);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, isRotating, nextPhotoReady, photoCount]);

  const selectPhoto = (index: number): void => {
    setPlayback(false);
    setActiveIndex((index + photoCount) % photoCount);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const target = event.target as HTMLElement;
    if (event.altKey || event.ctrlKey || event.metaKey || (target !== event.currentTarget && target.dataset.heroSlideControl !== "true")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      selectPhoto(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      selectPhoto(event.key === "Home" ? 0 : photoCount - 1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>): void => {
    if (pointerStartRef.current) return;
    suppressClickRef.current = false;
    if (!event.isPrimary || event.button !== 0 || (event.pointerType !== "mouse" && event.pointerType !== "pen") || (event.target as Element).closest("a, button, input, select, textarea, summary, [contenteditable]")) return;
    pointerStartRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>): void => {
    const start = pointerStartRef.current;
    if (!start || start.id !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      event.preventDefault();
      if (Math.abs(deltaX) >= swipeThreshold) suppressClickRef.current = true;
    }
  };

  const finishPointerGesture = (event: PointerEvent<HTMLElement>, cancelled = false): void => {
    const start = pointerStartRef.current;
    if (!start || start.id !== event.pointerId) return;
    pointerStartRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancelled) {
      suppressClickRef.current = false;
      return;
    }
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) >= swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      suppressClickRef.current = true;
      selectPhoto(activeIndex + (deltaX < 0 ? 1 : -1));
      event.preventDefault();
    }
  };

  return (
    <section
      ref={heroRef}
      className={`${heroStyles.hero} ${styles.carousel} ${isRotating ? styles.playing : ""} ${isDragging ? styles.dragging : ""}`}
      data-home-hero
      role="region"
      aria-roledescription="carousel"
      aria-label="Prime Tacos food photos"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setIsHovered(false); }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishPointerGesture(event)}
      onPointerCancel={(event) => finishPointerGesture(event, true)}
      onLostPointerCapture={(event) => finishPointerGesture(event, true)}
      onDragStart={(event) => { if (pointerStartRef.current) event.preventDefault(); }}
      onClickCapture={(event) => {
        const suppress = suppressClickRef.current && event.detail > 0;
        suppressClickRef.current = false;
        if (suppress) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onFocusCapture={() => setPlayback(false)}
      onTouchStart={(event) => {
        if (event.touches.length !== 1 || (event.target as Element).closest("a, button")) {
          touchStartRef.current = null;
          return;
        }
        const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStartRef.current;
        const touch = event.changedTouches[0];
        touchStartRef.current = null;
        if (!start || !touch) return;
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        if (Math.abs(deltaX) >= swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) selectPhoto(activeIndex + (deltaX < 0 ? 1 : -1));
      }}
      onTouchCancel={() => { touchStartRef.current = null; }}
    >
      <div className={styles.slides}>
        {heroFoodPhotos.map((photo, index) => (
          <div key={photo.id} className={`${styles.slide} ${index === activeIndex ? styles.active : ""}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${photoCount}`} aria-hidden={index !== activeIndex} data-hero-slide={index}>
            <FoodPhoto
              photo={photo}
              priority={index === 0}
              unoptimized
              sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 44vw, 576px"
              className={styles.photo}
              onLoad={() => setReadyPhotos((ready) => ready[index] ? ready : ready.map((loaded, photoIndex) => loaded || photoIndex === index))}
            />
          </div>
        ))}
      </div>
      <div className={heroStyles.copy}>
        <div className={heroStyles.brand}>
          <HomeLogoIntro />
        </div>
        <h1 id="home-title" className={heroStyles.title}>Home of the<br />Tri-Tip Taco</h1>
        <a href={orderHref} className={heroStyles.heroOrder}>Order online<SiteIcon name="arrow" /></a>
        <div className={styles.controls} role="group" aria-label="Food slideshow controls">
          {heroFoodPhotos.map((photo, index) => (
            <button key={photo.id} type="button" className={styles.selector} data-hero-slide-control="true" aria-label={`Show photo ${index + 1} of ${photoCount}: ${photo.label}`} aria-pressed={index === activeIndex} aria-current={index === activeIndex ? "true" : undefined} onClick={() => selectPhoto(index)} />
          ))}
        </div>
        <span className="sr-only" aria-live={isRotating ? "off" : "polite"} aria-atomic="true">Photo {activeIndex + 1} of {photoCount}: {heroFoodPhotos[activeIndex].label}</span>
      </div>
    </section>
  );
}
