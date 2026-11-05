"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type ReactElement } from "react";

import FoodPhoto from "@/components/FoodPhoto";
import SiteIcon from "@/components/SiteIcon";
import { foodPhotos } from "@/data/food-photos";
import { getReducedMotionServerSnapshot, getReducedMotionSnapshot, subscribeToReducedMotion } from "@/lib/accessibility-preferences";

import styles from "./FoodPhotoRail.module.css";

function loopPosition(position: number, width: number): number {
  return width + ((position - width) % width + width) % width;
}

const pixelsPerSecond = 28;
type BeltMotion = { animation: Animation; width: number };

function stopMotion(rail: HTMLDivElement, motionRef: { current: BeltMotion | null }): void {
  const motion = motionRef.current;
  if (!motion) return;
  motionRef.current = null;
  const time = motion.animation.currentTime;
  const duration = motion.width / pixelsPerSecond * 1000;
  const offset = typeof time === "number" ? ((time % duration + duration) % duration) / 1000 * pixelsPerSecond : 0;
  motion.animation.cancel();
  rail.scrollLeft = loopPosition(rail.scrollLeft + offset, motion.width);
}

export default function FoodPhotoRail(): ReactElement {
  const railId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const originalGroupRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<HTMLButtonElement>(null);
  const groupWidthRef = useRef(0);
  const motionRef = useRef<BeltMotion | null>(null);
  const [groupWidth, setGroupWidth] = useState(0);
  const [playback, setPlayback] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
  const isMoving = playback && !reducedMotion && !isHovered && isInView && documentVisible;

  useEffect(() => {
    const rail = railRef.current;
    const group = originalGroupRef.current;
    if (!rail || !group) return;

    const measure = (): void => {
      const width = group.getBoundingClientRect().width;
      if (!width || width === groupWidthRef.current) return;
      stopMotion(rail, motionRef);
      const previousWidth = groupWidthRef.current;
      const progress = previousWidth ? (loopPosition(rail.scrollLeft, previousWidth) - previousWidth) / previousWidth : 0;
      groupWidthRef.current = width;
      rail.scrollLeft = width * (1 + progress);
      setGroupWidth(width);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(rail);
    observer?.observe(group);
    window.addEventListener("resize", measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const updateVisibility = (): void => setDocumentVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    const rail = railRef.current;
    const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver((entries) => {
      setIsInView(entries.some((entry) => entry.isIntersecting));
    }, { threshold: 0.01 });
    if (rail) observer?.observe(rail);

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!isMoving || !rail || !track || !groupWidth) return;
    const offset = loopPosition(rail.scrollLeft, groupWidth) - groupWidth;
    rail.scrollLeft = groupWidth;
    const animation = track.animate([
      { transform: "translate3d(0, 0, 0)" },
      { transform: `translate3d(-${groupWidth}px, 0, 0)` },
    ], { duration: groupWidth / pixelsPerSecond * 1000, iterations: Infinity, easing: "linear" });
    animation.currentTime = offset / pixelsPerSecond * 1000;
    const motion = { animation, width: groupWidth };
    motionRef.current = motion;

    return () => {
      if (motionRef.current === motion) stopMotion(rail, motionRef);
    };
  }, [groupWidth, isMoving]);

  const normalizePosition = (): void => {
    const rail = railRef.current;
    const width = groupWidthRef.current;
    if (rail && width && (rail.scrollLeft < width || rail.scrollLeft >= width * 2)) rail.scrollLeft = loopPosition(rail.scrollLeft, width);
  };

  const pausePhotos = (): void => {
    setPlayback(false);
    const rail = railRef.current;
    if (rail) stopMotion(rail, motionRef);
  };

  const movePhotos = (direction: number): void => {
    pausePhotos();
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * .75, behavior: getReducedMotionSnapshot() ? "auto" : "smooth" });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target !== event.currentTarget) return;
    const rail = railRef.current;
    if (!rail) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      movePhotos(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      pausePhotos();
      const width = groupWidthRef.current;
      rail.scrollTo({ left: event.key === "Home" ? width : Math.max(width, width * 2 - rail.clientWidth), behavior: getReducedMotionSnapshot() ? "auto" : "smooth" });
    }
  };

  return (
    <section
      className={styles.section}
      aria-label="Prime Tacos food gallery"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setIsHovered(false); }}
      onFocusCapture={(event) => { if (event.target !== rotationRef.current) pausePhotos(); }}
    >
      <div ref={railRef} id={railId} className={styles.rail} role="region" aria-label="Scrollable food photos" tabIndex={0} onKeyDown={handleKeyDown} onScroll={normalizePosition} onPointerDown={pausePhotos} onWheel={(event) => { if (event.deltaX) pausePhotos(); }}>
        <div ref={trackRef} className={`${styles.track} ${isMoving ? styles.moving : ""}`} data-photo-track data-auto-moving={isMoving}>
          {(["before", "original", "after"] as const).map((group) => {
            const duplicate = group !== "original";
            return (
              <div key={group} ref={duplicate ? undefined : originalGroupRef} className={styles.photoGroup} data-photo-group={group} role={duplicate ? undefined : "list"} aria-label={duplicate ? undefined : "Prime Tacos food photos"} aria-hidden={duplicate ? true : undefined} inert={duplicate ? true : undefined}>
                {foodPhotos.map((photo) => {
                  const frame = photo.frame ?? photo;
                  return (
                    <figure key={photo.id} className={styles.photoItem} role="listitem" style={{ "--photo-ratio": frame.width / frame.height } as CSSProperties}>
                      <FoodPhoto photo={duplicate ? { ...photo, alt: "" } : photo} sizes="(max-width: 799px) 15rem, (max-width: 1173px) 30vw, 22rem" className={styles.photo} />
                    </figure>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.control} onClick={() => movePhotos(-1)} aria-label="Show previous food photos" aria-controls={railId}>
          <SiteIcon name="arrow" className={styles.previousIcon} />
        </button>
        <button type="button" className={styles.control} onClick={() => movePhotos(1)} aria-label="Show next food photos" aria-controls={railId}>
          <SiteIcon name="arrow" />
        </button>
        <button ref={rotationRef} type="button" className={`${styles.control} ${styles.rotation}`} disabled={reducedMotion} aria-label={reducedMotion ? "Automatic photo scrolling disabled for reduced motion" : playback ? "Pause photo scrolling" : "Play photo scrolling"} aria-controls={railId} onClick={() => { if (playback) pausePhotos(); else setPlayback(true); }}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d={playback && !reducedMotion ? "M5 4h3v12H5V4Zm7 0h3v12h-3V4Z" : "m6 3 11 7-11 7V3Z"} /></svg>
          <span>{playback && !reducedMotion ? "Pause" : "Play"}</span>
        </button>
      </div>
    </section>
  );
}
