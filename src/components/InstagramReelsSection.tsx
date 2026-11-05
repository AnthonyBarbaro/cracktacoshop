"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type ReactElement } from "react";

import InstagramReelEmbed from "@/components/InstagramReelEmbed";
import ReelViewer from "@/components/ReelViewer";
import ReelVideoPlayer from "@/components/ReelVideoPlayer";
import SiteIcon from "@/components/SiteIcon";
import { instagramReels } from "@/data/instagram-reels";
import { site } from "@/data/site-content";
import { getReducedMotionSnapshot } from "@/lib/accessibility-preferences";

import styles from "./InstagramReelsSection.module.css";

export default function InstagramReelsSection(): ReactElement {
  const titleId = useId();
  const railId = `${titleId}-reels`;
  const railRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const activeReel = activeIndex === null ? undefined : instagramReels[activeIndex];

  const updateEdges = useCallback((): void => {
    const rail = railRef.current;
    if (!rail) return;
    const start = rail.scrollLeft <= 1;
    const end = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1;
    setEdges((current) => current.start === start && current.end === end ? current : { start, end });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updateEdges);
    observer?.observe(rail);
    if (rail.firstElementChild) observer?.observe(rail.firstElementChild);
    window.addEventListener("resize", updateEdges);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  const movePreviews = (direction: number): void => {
    const rail = railRef.current;
    if (!rail) return;
    const first = rail.firstElementChild as HTMLElement | null;
    const second = first?.nextElementSibling as HTMLElement | null;
    const distance = first && second ? second.offsetLeft - first.offsetLeft : rail.clientWidth;
    rail.scrollBy({ left: direction * distance, behavior: getReducedMotionSnapshot() ? "auto" : "smooth" });
  };

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <div className={styles.headingRow}>
          <h2 id={titleId} className={styles.heading}>Reels</h2>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={styles.more} aria-label="More on Instagram (opens in a new tab)">More on Instagram<SiteIcon name="arrow" /></a>
        </div>
        <div className={styles.carousel}>
          <ul ref={railRef} id={railId} className={styles.reels} aria-label="Prime Taco Shop reels" tabIndex={0} onScroll={updateEdges}>
            {instagramReels.map((reel, index) => (
              <li key={reel.id} className={styles.reel}>
                <button type="button" className={styles.watch} aria-label={`Watch ${reel.title}`} aria-haspopup="dialog" onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setActiveIndex(index); }}>
                  <span className={styles.poster}>
                    <Image src={reel.poster} alt={reel.posterAlt} fill sizes="(max-width: 639px) 72vw, (max-width: 1056px) 33vw, 320px" className={styles.posterImage} />
                  </span>
                  <span className={styles.reelTitle}>{reel.title}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.previewArrows} role="group" aria-label="Reel preview navigation">
            <button type="button" className={styles.previewArrow} aria-label="Previous reels" aria-controls={railId} disabled={edges.start} onClick={() => movePreviews(-1)}><SiteIcon name="arrow" className={styles.previousArrow} /></button>
            <button type="button" className={styles.previewArrow} aria-label="Next reels" aria-controls={railId} disabled={edges.end} onClick={() => movePreviews(1)}><SiteIcon name="arrow" /></button>
          </div>
        </div>
        <p className={styles.hint}>Tap to play. Swipe through all {instagramReels.length} reels.</p>
      </div>
      {activeReel && activeIndex !== null && (
        <ReelViewer reels={instagramReels} index={activeIndex} onIndexChange={setActiveIndex} onClose={() => setActiveIndex(null)}>
          {activeReel.videoSrc
            ? <ReelVideoPlayer key={activeReel.id} src={activeReel.videoSrc} poster={activeReel.poster} title={activeReel.title} muted={muted} onMutedChange={setMuted} />
            : <InstagramReelEmbed key={activeReel.id} reel={activeReel} />}
        </ReelViewer>
      )}
    </section>
  );
}
