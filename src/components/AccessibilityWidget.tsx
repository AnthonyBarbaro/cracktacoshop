"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactElement } from "react";

import { AccessibilityIcon } from "@/components/AccessibilityNavButton";
import { site } from "@/data/site-content";
import {
  ACCESSIBILITY_OPEN_EVENT,
  accessibilityOptions,
  fontScales,
  getAccessibilityPreferencesServerSnapshot,
  getAccessibilityPreferencesSnapshot,
  openAccessibilitySettings,
  resetAccessibilityPreferences,
  setAccessibilityPreferences,
  subscribeToAccessibilityChanges,
  type AccessibilityOption,
} from "@/lib/accessibility-preferences";

import styles from "./AccessibilityWidget.module.css";

export default function AccessibilityWidget(): ReactElement {
  const preferences = useSyncExternalStore(
    subscribeToAccessibilityChanges,
    getAccessibilityPreferencesSnapshot,
    getAccessibilityPreferencesServerSnapshot,
  );
  const panelRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const initialFontSize = root.style.fontSize;
    root.style.fontSize = `${preferences.fontScale * 100}%`;
    for (const { key } of accessibilityOptions) {
      root.setAttribute(`data-a11y-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, String(preferences[key]));
    }
    return () => {
      root.style.fontSize = initialFontSize;
      for (const { key } of accessibilityOptions) {
        root.removeAttribute(`data-a11y-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);
      }
    };
  }, [preferences]);

  useEffect(() => {
    const open = (): void => {
      const panel = panelRef.current;
      if (!panel || panel.open) return;
      panel.showModal();
      closeRef.current?.focus();
    };
    window.addEventListener(ACCESSIBILITY_OPEN_EVENT, open);
    return () => window.removeEventListener(ACCESSIBILITY_OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    if (!preferences.readingGuide) return;
    const moveGuide = (y: number): void => {
      if (guideRef.current) guideRef.current.style.transform = `translateY(${Math.max(0, y - 24)}px)`;
    };
    const onPointerMove = (event: PointerEvent): void => moveGuide(event.clientY);
    const onFocus = (event: FocusEvent): void => {
      if (!(event.target instanceof HTMLElement)) return;
      const bounds = event.target.getBoundingClientRect();
      moveGuide(bounds.top + bounds.height / 2);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("focusin", onFocus);
    };
  }, [preferences.readingGuide]);

  const toggleOption = (key: AccessibilityOption, checked: boolean): void => {
    setAccessibilityPreferences({
      ...preferences,
      [key]: checked,
      ...(key === "contrast" && checked ? { dark: false } : {}),
      ...(key === "dark" && checked ? { contrast: false } : {}),
    });
  };
  const fontIndex = fontScales.indexOf(preferences.fontScale);

  return (
    <div data-accessibility-widget>
      {!preferences.hidden && (
        <button type="button" className={styles.floatingButton} onClick={openAccessibilitySettings} aria-label="Accessibility options" aria-haspopup="dialog" aria-controls="accessibility-widget-panel">
          <AccessibilityIcon />
        </button>
      )}
      <dialog ref={panelRef} id="accessibility-widget-panel" className={styles.panel} aria-labelledby="accessibility-title" aria-describedby="accessibility-description" onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
          .filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}>
        <div className={styles.header}>
          <div>
            <h2 id="accessibility-title">Accessibility options</h2>
            <p id="accessibility-description">Adjust the display for easier reading and browsing.</p>
          </div>
          <button ref={closeRef} type="button" className={styles.action} onClick={() => panelRef.current?.close()} aria-label="Close accessibility options">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className={styles.body}>
          <fieldset className={styles.textSize}>
            <legend>Text size</legend>
            <div className={styles.textSizeControl}>
              <button type="button" className={styles.action} disabled={fontIndex === 0} onClick={() => setAccessibilityPreferences({ ...preferences, fontScale: fontScales[fontIndex - 1] })} aria-label="Decrease text size" aria-controls="accessibility-text-size">−</button>
              <output id="accessibility-text-size" aria-live="polite">{preferences.fontScale * 100}%</output>
              <button type="button" className={styles.action} disabled={fontIndex === fontScales.length - 1} onClick={() => setAccessibilityPreferences({ ...preferences, fontScale: fontScales[fontIndex + 1] })} aria-label="Increase text size" aria-controls="accessibility-text-size">+</button>
            </div>
          </fieldset>
          <div className={styles.options}>
            {accessibilityOptions.map(({ key, label }) => (
              <label key={key} className={styles.option}>
                <input type="checkbox" checked={preferences[key]} onChange={(event) => toggleOption(key, event.target.checked)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <button type="button" className={styles.action} onClick={resetAccessibilityPreferences}>Reset all settings</button>
          <button type="button" className={styles.action} onClick={() => {
            panelRef.current?.close();
            setAccessibilityPreferences({ ...preferences, hidden: !preferences.hidden });
            if (!preferences.hidden) {
              window.requestAnimationFrame(() => {
                const opener = document.querySelector<HTMLButtonElement>('header button[aria-controls="accessibility-widget-panel"]');
                const fallback = document.querySelector<HTMLButtonElement>('button[aria-label="Open menu"]');
                (opener && opener.getClientRects().length > 0 ? opener : fallback)?.focus();
              });
            }
          }}>{preferences.hidden ? "Show floating button" : "Hide floating button"}</button>
        </div>
        <p className={styles.note}>Need help using our site? <a href={`tel:${site.phone}`}>Call {site.phone}</a>. Display choices are saved on this device.</p>
      </dialog>
      <div ref={guideRef} className={styles.readingGuide} hidden={!preferences.readingGuide} aria-hidden="true" />
    </div>
  );
}
