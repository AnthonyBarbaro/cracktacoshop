"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";

import styles from "./ReelVideoPlayer.module.css";

type Props = { src: string; poster: string; title: string; muted: boolean; onMutedChange: (muted: boolean) => void };

export default function ReelVideoPlayer({ src, poster, title, muted, onMutedChange }: Props): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const requestPlayback = useCallback(async (video: HTMLVideoElement, isActive: () => boolean): Promise<void> => {
    try {
      await video.play();
    } catch (error) {
      if (!isActive()) return;
      const blocked = typeof error === "object" && error !== null && "name" in error && error.name === "NotAllowedError";
      if (!video.muted && blocked) {
        video.muted = true;
        onMutedChange(true);
        try { await video.play(); } catch { if (isActive()) setIsPlaying(false); }
      } else setIsPlaying(false);
    }
  }, [onMutedChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let mounted = true;
    if (video.getAttribute("src") !== src) video.src = src;
    void requestPlayback(video, () => mounted);
    const pauseWhenHidden = (): void => { if (document.visibilityState === "hidden") video.pause(); };
    document.addEventListener("visibilitychange", pauseWhenHidden);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, requestPlayback]);

  const togglePlayback = (): void => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      setFailed(false);
      void requestPlayback(video, () => videoRef.current === video);
    } else video.pause();
  };

  return (
    <div className={styles.player}>
      <video ref={videoRef} key={src} src={src} poster={poster} aria-label={title} autoPlay muted={muted} playsInline controls preload="metadata" className={styles.video} onPlaying={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onLoadStart={() => setFailed(false)} onError={(event) => { if (event.currentTarget.getAttribute("src") !== src) return; setFailed(true); setIsPlaying(false); }} onVolumeChange={(event) => onMutedChange(event.currentTarget.muted)} />
      <button type="button" data-reel-gesture="true" className={styles.gesture} aria-label={isPlaying ? "Pause video" : "Play video"} onClick={togglePlayback}>
        {!isPlaying && (
          <span className={styles.playIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7V5Z" /></svg></span>
        )}
      </button>
      <button type="button" className={styles.sound} aria-label={muted ? "Unmute video" : "Mute video"} aria-pressed={!muted} onClick={() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        onMutedChange(video.muted);
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          {muted ? <path d="m16 9 6 6m0-6-6 6" /> : <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></>}
        </svg>
      </button>
      {failed && <p role="status" className={styles.error}>This video couldn’t load. Watch it on Instagram below.</p>}
    </div>
  );
}
