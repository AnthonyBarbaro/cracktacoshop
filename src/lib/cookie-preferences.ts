export type CookiePreference = "unset" | "enabled" | "disabled";

export const COOKIE_PREFERENCE_STORAGE_KEY = "cts-cookie-preference";
export const COOKIE_PREFERENCE_CHANGE_EVENT = "cts-cookie-preference-change";
export const COOKIE_SETTINGS_OPEN_EVENT = "cts-cookie-settings-open";

let temporaryPreference: CookiePreference | undefined;

export function getCookiePreferenceSnapshot(): CookiePreference {
  if (typeof window === "undefined") {
    return "unset";
  }

  if (temporaryPreference) {
    return temporaryPreference;
  }

  try {
    const value = window.localStorage.getItem(COOKIE_PREFERENCE_STORAGE_KEY);
    return value === "enabled" || value === "disabled" ? value : "unset";
  } catch {
    return "unset";
  }
}

export function getCookiePreferenceServerSnapshot(): CookiePreference {
  return "unset";
}

export function setCookiePreference(preference: Exclude<CookiePreference, "unset">): void {
  temporaryPreference = preference;

  try {
    // Keep this essential choice even when optional storage is disabled.
    window.localStorage.setItem(COOKIE_PREFERENCE_STORAGE_KEY, preference);
    temporaryPreference = undefined;
  } catch {
    // The choice still applies to this visit when storage is unavailable.
  }

  const keysToRemove = preference === "disabled"
    ? ["cts-cookie-notice-dismissed", "cts-shopping-location-slug"]
    : ["cts-cookie-notice-dismissed"];
  for (const key of keysToRemove) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Optional preferences are ignored when storage cannot be cleared.
    }
  }

  window.dispatchEvent(new Event(COOKIE_PREFERENCE_CHANGE_EVENT));
}

export function subscribeToCookiePreferenceChanges(callback: () => void): () => void {
  const handleStorage = (event: StorageEvent): void => {
    if (event.key === COOKIE_PREFERENCE_STORAGE_KEY || event.key === null) {
      callback();
    }
  };

  window.addEventListener(COOKIE_PREFERENCE_CHANGE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(COOKIE_PREFERENCE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_OPEN_EVENT));
}
