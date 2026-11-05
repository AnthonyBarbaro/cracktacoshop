"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type PointerEvent, type ReactElement, type ReactNode } from "react";

import SiteIcon from "@/components/SiteIcon";
import type { InstagramReel } from "@/data/instagram-reels";

import styles from "./ReelViewer.module.css";

type Props = {
  reels: InstagramReel[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  children: ReactNode;
};

export default function ReelViewer({ reels, index, onIndexChange, onClose, children }: Props): ReactElement | null {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const pointerRef = useRef<{ id: number; x: number; y: number; target: Element } | null>(null);
  const suppressClickRef = useRef(false);
  const clickResetFrameRef = useRef(0);
  const titleId = useId();
  const countId = useId();
  const currentIndex = reels.length ? (index % reels.length + reels.length) % reels.length : 0;
  const reel = reels[currentIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    closingRef.current = false;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      closingRef.current = true;
      const pointer = pointerRef.current;
      if (pointer?.target.hasPointerCapture(pointer.id)) pointer.target.releasePointerCapture(pointer.id);
      pointerRef.current = null;
      if (clickResetFrameRef.current) window.cancelAnimationFrame(clickResetFrameRef.current);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = 0;
    bodyRef.current.scrollLeft = 0;
  }, [reel?.id]);

  const requestClose = (): void => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
  };

  const clearPointer = (): void => {
    const pointer = pointerRef.current;
    pointerRef.current = null;
    if (pointer?.target.hasPointerCapture(pointer.id)) pointer.target.releasePointerCapture(pointer.id);
  };

  const selectReel = (nextIndex: number): void => {
    clearPointer();
    if (reels.length < 2) return;
    const active = document.activeElement as HTMLElement | null;
    if (active?.closest("[data-reel-gesture]")) closeRef.current?.focus({ preventScroll: true });
    onIndexChange(nextIndex);
  };

  const navigate = (direction: number): void => {
    selectReel((currentIndex + direction + reels.length) % reels.length);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDialogElement>): void => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      clearPointer();
      return;
    }
    const target = event.target as Element;
    const gesture = target.closest("[data-reel-gesture]");
    if (!gesture && target.closest("[data-reel-content], button, a, input, select, textarea, video, audio, iframe, [contenteditable]")) return;
    suppressClickRef.current = false;
    if (clickResetFrameRef.current) window.cancelAnimationFrame(clickResetFrameRef.current);
    const captureTarget = gesture ?? event.currentTarget;
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, target: captureTarget };
    captureTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDialogElement>): void => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const deltaX = event.clientX - pointer.x;
    const deltaY = event.clientY - pointer.y;
    const dominant = Math.max(Math.abs(deltaX), Math.abs(deltaY));
    const secondary = Math.min(Math.abs(deltaX), Math.abs(deltaY));
    clearPointer();
    if (dominant <= 12) return;
    suppressClickRef.current = true;
    if (dominant >= 45 && (!secondary || dominant / secondary >= 1.2)) {
      const movement = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      navigate(movement < 0 ? 1 : -1);
    }
    clickResetFrameRef.current = window.requestAnimationFrame(() => {
      clickResetFrameRef.current = 0;
      suppressClickRef.current = false;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>): void => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key === "Tab") {
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'))
        .filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest('[inert], [hidden], [aria-hidden="true"]'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        event.preventDefault();
        event.currentTarget.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    const target = event.target as HTMLElement;
    const gesture = target.closest("[data-reel-gesture]");
    if (!gesture && target.closest("[data-reel-content]")) return;
    const control = target.closest("button, a, input, select, textarea, video, audio, iframe, [contenteditable], [role=slider]");
    if (control && !control.hasAttribute("data-reel-control") && !gesture) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      navigate(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      selectReel(event.key === "Home" ? 0 : reels.length - 1);
    }
  };

  if (!reel) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={countId}
      tabIndex={-1}
      onClose={(event) => { if (!event.currentTarget.open) requestClose(); }}
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onKeyDown={handleKeyDown}
      onPointerDownCapture={handlePointerDown}
      onPointerUpCapture={handlePointerUp}
      onPointerCancel={clearPointer}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return;
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>{reel.title}</h2>
            <p id={countId} className={styles.count} aria-live="polite">{currentIndex + 1} / {reels.length}</p>
          </div>
          <button ref={closeRef} type="button" className={styles.control} data-reel-control data-reel-close onClick={requestClose} aria-label="Close video">
            <SiteIcon name="close" />
          </button>
        </header>
        <div ref={bodyRef} className={`${styles.body} ${reel.videoSrc ? styles.videoBody : ""}`} data-reel-content>
          <div className={`${styles.content} ${reel.videoSrc ? styles.videoContent : ""}`}>{children}</div>
        </div>
        <footer className={styles.footer}>
          <button type="button" className={styles.control} data-reel-control onClick={() => navigate(-1)} disabled={reels.length < 2} aria-label="Previous video">
            <SiteIcon name="arrow" className={styles.previousIcon} />
          </button>
          <a href={reel.href} target="_blank" rel="noopener noreferrer" className={styles.externalLink} aria-label={`Watch ${reel.title} on Instagram (opens in a new tab)`}>Watch on Instagram</a>
          <button type="button" className={styles.control} data-reel-control onClick={() => navigate(1)} disabled={reels.length < 2} aria-label="Next video">
            <SiteIcon name="arrow" />
          </button>
        </footer>
      </div>
    </dialog>
  );
}
