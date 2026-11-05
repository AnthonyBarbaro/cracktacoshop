"use client";

import type { ReactElement } from "react";

import { openAccessibilitySettings } from "@/lib/accessibility-preferences";

import styles from "./AccessibilityWidget.module.css";

export function AccessibilityIcon(): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="4.25" r="2.25" fill="currentColor" />
      <path d="M4.75 8.25c2.35 1.1 4.77 1.65 7.25 1.65s4.9-.55 7.25-1.65M12 10v4.2m0 0-3.15 5.55M12 14.2l3.15 5.55" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default function AccessibilityNavButton({ showLabel = false }: { showLabel?: boolean }): ReactElement {
  return (
    <button
      type="button"
      className={styles.navButton}
      onClick={openAccessibilitySettings}
      aria-label="Accessibility options"
      aria-haspopup="dialog"
      aria-controls="accessibility-widget-panel"
      title="Accessibility options"
    >
      <AccessibilityIcon />
      {showLabel && <span>Accessibility</span>}
    </button>
  );
}
