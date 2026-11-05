import assert from "node:assert/strict";
import test from "node:test";
import { createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader, loadSourceModule } from "./helpers.mjs";

function makeHarness({ blocked = false, reducedMotion = false } = {}) {
  const storage = new Map();
  const browserWindow = new EventTarget();
  const media = new EventTarget();
  media.matches = reducedMotion;
  browserWindow.matchMedia = () => media;
  browserWindow.localStorage = {
    getItem(key) {
      if (blocked) throw new Error("Storage unavailable");
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      if (blocked) throw new Error("Storage unavailable");
      storage.set(key, value);
    },
    removeItem(key) {
      if (blocked) throw new Error("Storage unavailable");
      storage.delete(key);
    },
  };
  const load = createSourceLoader({ window: browserWindow });
  return { storage, media, window: browserWindow, preferences: load("src/lib/accessibility-preferences.ts") };
}

test("server accessibility defaults are stable and do not require browser APIs", () => {
  const preferences = loadSourceModule("src/lib/accessibility-preferences.ts");
  assert.equal(preferences.getAccessibilityPreferencesServerSnapshot(), preferences.getAccessibilityPreferencesSnapshot());
  assert.equal(preferences.getAccessibilityPreferencesSnapshot().fontScale, 1);
  assert.equal(preferences.getReducedMotionServerSnapshot(), true);
});

test("stored accessibility settings are validated before use", () => {
  const { preferences, storage } = makeHarness();
  const defaults = preferences.defaultAccessibilityPreferences;
  for (const value of [null, [], "invalid", 0]) {
    const parsed = preferences.parseAccessibilityPreferences(value);
    for (const key of Object.keys(defaults)) assert.equal(parsed[key], defaults[key]);
  }
  const parsed = preferences.parseAccessibilityPreferences({ fontScale: 999, motion: "false", links: 1, hidden: "true", contrast: true, dark: true });
  assert.equal(parsed.fontScale, 1);
  assert.equal(parsed.motion, false);
  assert.equal(parsed.links, false);
  assert.equal(parsed.hidden, false);
  assert.equal(parsed.contrast, true);
  assert.equal(parsed.dark, false);
  storage.set(preferences.ACCESSIBILITY_STORAGE_KEY, "{broken json");
  assert.equal(preferences.getAccessibilityPreferencesSnapshot().fontScale, 1);
});

test("display choices persist independently of optional cookies and reset without removing other settings", () => {
  const { preferences, storage } = makeHarness();
  storage.set("cts-cookie-preference", "disabled");
  preferences.setAccessibilityPreferences({ ...preferences.defaultAccessibilityPreferences, fontScale: 2, links: true, motion: true });
  const snapshot = preferences.getAccessibilityPreferencesSnapshot();
  assert.equal(snapshot.fontScale, 2);
  assert.equal(snapshot.links, true);
  assert.equal(snapshot, preferences.getAccessibilityPreferencesSnapshot());
  assert.equal(JSON.parse(storage.get(preferences.ACCESSIBILITY_STORAGE_KEY)).motion, true);
  assert.equal(storage.get("cts-cookie-preference"), "disabled");
  preferences.resetAccessibilityPreferences();
  assert.equal(storage.has(preferences.ACCESSIBILITY_STORAGE_KEY), false);
  assert.equal(preferences.getAccessibilityPreferencesSnapshot().motion, false);
  assert.equal(storage.get("cts-cookie-preference"), "disabled");
});

test("settings and reset continue to work when browser storage is blocked", () => {
  const { preferences } = makeHarness({ blocked: true });
  preferences.setAccessibilityPreferences({ ...preferences.defaultAccessibilityPreferences, fontScale: 1.5, hidden: true });
  assert.equal(preferences.getAccessibilityPreferencesSnapshot().fontScale, 1.5);
  assert.equal(preferences.getAccessibilityPreferencesSnapshot().hidden, true);
  preferences.resetAccessibilityPreferences();
  assert.equal(preferences.getAccessibilityPreferencesSnapshot().fontScale, 1);
  assert.equal(preferences.getAccessibilityPreferencesSnapshot().hidden, false);
});

test("motion follows system and site preferences, with listeners cleaned up on unsubscribe", () => {
  const { preferences, media } = makeHarness();
  let changes = 0;
  const unsubscribe = preferences.subscribeToReducedMotion(() => { changes++; });
  assert.equal(preferences.getReducedMotionSnapshot(), false);
  media.matches = true;
  media.dispatchEvent(new Event("change"));
  assert.equal(preferences.getReducedMotionSnapshot(), true);
  media.matches = false;
  preferences.setAccessibilityPreferences({ ...preferences.defaultAccessibilityPreferences, motion: true });
  assert.equal(preferences.getReducedMotionSnapshot(), true);
  assert.equal(changes, 2);
  unsubscribe();
  preferences.resetAccessibilityPreferences();
  media.dispatchEvent(new Event("change"));
  assert.equal(changes, 2);
});

test("storage updates from another tab refresh preferences and the navigation button can reopen settings", () => {
  const { preferences, storage, window } = makeHarness();
  let changes = 0;
  let opens = 0;
  const unsubscribe = preferences.subscribeToAccessibilityChanges(() => { changes++; });
  window.addEventListener(preferences.ACCESSIBILITY_OPEN_EVENT, () => { opens++; });
  storage.set(preferences.ACCESSIBILITY_STORAGE_KEY, JSON.stringify({ dark: true }));
  const event = Object.assign(new Event("storage"), { key: preferences.ACCESSIBILITY_STORAGE_KEY });
  window.dispatchEvent(event);
  assert.equal(changes, 1);
  assert.equal(preferences.getAccessibilityPreferencesSnapshot().dark, true);
  preferences.openAccessibilitySettings();
  assert.equal(opens, 1);
  unsubscribe();
  window.dispatchEvent(event);
  assert.equal(changes, 1);
});

test("accessibility dialog wraps keyboard focus at both ends", () => {
  const document = { activeElement: null };
  const load = createSourceLoader({
    document,
    require: (specifier) => specifier.endsWith(".module.css")
      ? { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) }
      : undefined,
  });
  const Widget = load("src/components/AccessibilityWidget.tsx").default;
  let tree;
  function CaptureWidget() {
    tree = Widget();
    return tree;
  }
  renderToStaticMarkup(createElement(CaptureWidget));
  const dialog = tree.props.children.find((child) => isValidElement(child) && child.type === "dialog");
  const makeControl = (visible = true) => ({
    tabIndex: 0,
    getClientRects: () => visible ? [{}] : [],
    focus() { document.activeElement = this; },
  });
  const first = makeControl();
  const last = makeControl();
  const hidden = makeControl(false);
  let prevented = 0;
  const event = {
    key: "Tab",
    shiftKey: false,
    currentTarget: { querySelectorAll: () => [first, last, hidden] },
    preventDefault: () => { prevented++; },
  };
  document.activeElement = last;
  dialog.props.onKeyDown(event);
  assert.equal(document.activeElement, first);
  assert.equal(prevented, 1);
  dialog.props.onKeyDown({ ...event, shiftKey: true });
  assert.equal(document.activeElement, last);
  assert.equal(prevented, 2);
  dialog.props.onKeyDown({ ...event, key: "Escape" });
  assert.equal(prevented, 2);
});
