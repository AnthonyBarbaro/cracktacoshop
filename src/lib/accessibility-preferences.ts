export const ACCESSIBILITY_STORAGE_KEY = "prime-accessibility-preferences";
export const ACCESSIBILITY_CHANGE_EVENT = "prime-accessibility-change";
export const ACCESSIBILITY_OPEN_EVENT = "prime-accessibility-open";

export const fontScales = [1, 1.25, 1.5, 1.75, 2] as const;
export const accessibilityOptions = [
  { key: "contrast", label: "High contrast" },
  { key: "dark", label: "Dark mode" },
  { key: "grayscale", label: "Grayscale" },
  { key: "links", label: "Underline links" },
  { key: "highlight", label: "Highlight links and buttons" },
  { key: "readableFont", label: "Readable font" },
  { key: "lineHeight", label: "Increase line height" },
  { key: "letterSpacing", label: "Increase letter spacing" },
  { key: "alignLeft", label: "Align text left" },
  { key: "hideImages", label: "Hide images" },
  { key: "readingGuide", label: "Reading guide" },
  { key: "motion", label: "Reduce motion" },
] as const;

export type AccessibilityOption = typeof accessibilityOptions[number]["key"];
export type AccessibilityPreferences = Record<AccessibilityOption, boolean> & {
  fontScale: typeof fontScales[number];
  hidden: boolean;
};

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  fontScale: 1,
  contrast: false,
  dark: false,
  grayscale: false,
  links: false,
  highlight: false,
  readableFont: false,
  lineHeight: false,
  letterSpacing: false,
  alignLeft: false,
  hideImages: false,
  readingGuide: false,
  motion: false,
  hidden: false,
};

let cachedValue: string | null | undefined;
let cachedPreferences = defaultAccessibilityPreferences;
let temporaryPreferences: AccessibilityPreferences | undefined;

export function parseAccessibilityPreferences(value: unknown): AccessibilityPreferences {
  const preferences = { ...defaultAccessibilityPreferences };
  if (!value || typeof value !== "object" || Array.isArray(value)) return preferences;

  const stored = value as Record<string, unknown>;
  for (const { key } of accessibilityOptions) preferences[key] = stored[key] === true;
  preferences.fontScale = fontScales.find((scale) => scale === stored.fontScale) ?? 1;
  preferences.hidden = stored.hidden === true;
  if (preferences.contrast) preferences.dark = false;
  return preferences;
}

export function getAccessibilityPreferencesSnapshot(): AccessibilityPreferences {
  if (typeof window === "undefined") return defaultAccessibilityPreferences;
  if (temporaryPreferences) return temporaryPreferences;

  try {
    const value = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (value !== cachedValue) {
      cachedPreferences = parseAccessibilityPreferences(value ? JSON.parse(value) : null);
      cachedValue = value;
    }
  } catch {
    // Keep the current settings when storage is unavailable or contains invalid JSON.
  }
  return cachedPreferences;
}

export function getAccessibilityPreferencesServerSnapshot(): AccessibilityPreferences {
  return defaultAccessibilityPreferences;
}

export function setAccessibilityPreferences(preferences: AccessibilityPreferences): void {
  temporaryPreferences = parseAccessibilityPreferences(preferences);
  try {
    const value = JSON.stringify(temporaryPreferences);
    // Explicitly chosen accessibility settings are retained independently of optional cookies.
    window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, value);
    cachedPreferences = temporaryPreferences;
    cachedValue = value;
    temporaryPreferences = undefined;
  } catch {
    // The settings still apply to this visit when storage cannot be written.
  }
  window.dispatchEvent(new Event(ACCESSIBILITY_CHANGE_EVENT));
}

export function resetAccessibilityPreferences(): void {
  temporaryPreferences = defaultAccessibilityPreferences;
  cachedPreferences = defaultAccessibilityPreferences;
  try {
    window.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    cachedValue = null;
    temporaryPreferences = undefined;
  } catch {
    // Reset still works for this visit when storage cannot be cleared.
  }
  window.dispatchEvent(new Event(ACCESSIBILITY_CHANGE_EVENT));
}

export function subscribeToAccessibilityChanges(callback: () => void): () => void {
  const handleStorage = (event: StorageEvent): void => {
    if (event.key === ACCESSIBILITY_STORAGE_KEY || event.key === null) {
      temporaryPreferences = undefined;
      callback();
    }
  };
  window.addEventListener(ACCESSIBILITY_CHANGE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(ACCESSIBILITY_CHANGE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function openAccessibilitySettings(): void {
  window.dispatchEvent(new Event(ACCESSIBILITY_OPEN_EVENT));
}

export function getReducedMotionSnapshot(): boolean {
  return getAccessibilityPreferencesSnapshot().motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getReducedMotionServerSnapshot(): boolean {
  return true;
}

export function subscribeToReducedMotion(callback: () => void): () => void {
  const unsubscribe = subscribeToAccessibilityChanges(callback);
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => {
    unsubscribe();
    media.removeEventListener("change", callback);
  };
}
