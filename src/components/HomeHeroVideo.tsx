"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactElement } from "react";

const videoBase = "https://cdn.prod.website-files.com/696ade60affd7395b52deb31%2F6a8db7a3fd8ca01e078faac4_Copy%20of%20ST-Home-2";
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

export default function HomeHeroVideo(): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playback, setPlayback] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const shouldPlay = playback ?? !reducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let isInView = false;
    const updatePlayback = (): void => {
      if (shouldPlay && isInView && document.visibilityState === "visible") {
        void video.play().catch(() => {
          // Autoplay can be blocked; keep the manual play control available.
          setIsPlaying(!video.paused);
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      updatePlayback();
    });

    observer.observe(video);
    document.addEventListener("visibilitychange", updatePlayback);
    updatePlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, [shouldPlay]);

  const togglePlayback = (): void => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      setPlayback(true);
      void video.play().catch(() => setIsPlaying(!video.paused));
    } else {
      setPlayback(false);
      video.pause();
    }
  };

  return (
    <div className="home-film">
      <video
        ref={videoRef}
        className="home-film-video"
        muted
        loop
        playsInline
        preload="none"
        poster="/images/food-3.jpg"
        aria-label="Taco preparation"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      >
        <source src={`${videoBase}_mp4.mp4`} type="video/mp4" />
        <source src={`${videoBase}_webm.webm`} type="video/webm" />
        Your browser does not support video.
      </video>
      <button
        type="button"
        className="home-film-control"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        title={isPlaying ? "Pause video" : "Play video"}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d={isPlaying ? "M5 4h3v12H5V4Zm7 0h3v12h-3V4Z" : "m6 3 11 7-11 7V3Z"} />
        </svg>
      </button>
    </div>
  );
}
