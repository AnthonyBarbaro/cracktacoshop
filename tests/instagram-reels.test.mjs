import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader, loadSourceModule } from "./helpers.mjs";

const { instagramReels } = loadSourceModule("src/data/instagram-reels.ts");

function cssBoundary(specifier) {
  if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) };
  return undefined;
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement(node)) return [];
  return [node, ...elements(node.props.children)];
}

function makeReelsHarness() {
  let cursor = 0;
  let nextId = 0;
  let dirty = true;
  let effects = [];
  let tree;
  let reducedMotion = false;
  const slots = [];
  const observers = [];
  const listeners = new Map();
  const scrolls = [];
  const first = { offsetLeft: 0, nextElementSibling: { offsetLeft: 308 } };
  const rail = {
    clientWidth: 900,
    scrollWidth: 2450,
    scrollLeft: 0,
    firstElementChild: first,
    scrollBy: (options) => {
      scrolls.push({ ...options });
      rail.scrollLeft = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, rail.scrollLeft + options.left));
      elements(tree).find((element) => element.type === "ul").props.onScroll();
    },
  };
  const hooks = {
    useRef: (initial) => { const index = cursor++; slots[index] ??= { value: { current: initial } }; return slots[index].value; },
    useId: () => hooks.useRef(`reels-test-${nextId++}`).current,
    useState: (initial) => {
      const index = cursor++;
      slots[index] ??= { value: initial };
      return [slots[index].value, (next) => {
        const value = typeof next === "function" ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useCallback: (callback, dependencies) => {
      const index = cursor++;
      const slot = slots[index];
      if (!slot || dependencies.some((value, offset) => !Object.is(value, slot.dependencies[offset]))) slots[index] = { value: callback, dependencies };
      return slots[index].value;
    },
    useEffect: (create, dependencies) => {
      const index = cursor++;
      const slot = slots[index];
      if (!slot || dependencies.some((value, offset) => !Object.is(value, slot.dependencies[offset]))) effects.push(() => {
        slot?.cleanup?.();
        slots[index] = { dependencies, cleanup: create() };
      });
    },
  };
  class ResizeObserver {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe() { this.callback(); }
    disconnect() { this.disconnected = true; }
  }
  const load = createSourceLoader({
    ResizeObserver,
    window: { addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: (name, callback) => { if (listeners.get(name) === callback) listeners.delete(name); } },
    require: (specifier) => {
      if (specifier === "react") return { ...React, ...hooks };
      if (specifier === "@/lib/accessibility-preferences") return { getReducedMotionSnapshot: () => reducedMotion };
      return cssBoundary(specifier);
    },
  });
  const Reels = load("src/components/InstagramReelsSection.tsx").default;
  const flush = () => {
    let renders = 0;
    while (dirty) {
      assert.ok(renders++ < 10, "preview state settles after effects");
      dirty = false;
      cursor = 0;
      effects = [];
      tree = Reels();
      elements(tree).find((element) => element.type === "ul").props.ref.current = rail;
      effects.forEach((commit) => commit());
    }
    return tree;
  };
  flush();
  return {
    rail, scrolls, observers, listeners, flush,
    get tree() { return flush(); },
    cards: () => elements(flush()).filter((element) => element.props["aria-haspopup"] === "dialog"),
    viewer: () => elements(flush()).find((element) => element.type?.name === "ReelViewer"),
    arrow: (label) => elements(flush()).find((element) => element.props["aria-label"] === label),
    scrollTo: (left) => { rail.scrollLeft = left; elements(flush()).find((element) => element.type === "ul").props.onScroll(); flush(); },
    resize: (width) => { rail.clientWidth = width; rail.scrollLeft = Math.max(0, Math.min(rail.scrollLeft, rail.scrollWidth - width)); observers[0].callback(); flush(); },
    reduceMotion: () => { reducedMotion = true; },
    unmount: () => slots.forEach((slot) => slot?.cleanup?.()),
  };
}

test("reels show real local posters without loading an external player before a click", () => {
  const Reels = createSourceLoader({ require: cssBoundary })("src/components/InstagramReelsSection.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Reels));
  assert.match(html, />Reels<\/h2>/);
  assert.equal([...html.matchAll(/aria-haspopup="dialog"/g)].length, instagramReels.length);
  assert.equal([...html.matchAll(/<img\b/g)].length, instagramReels.length);
  assert.doesNotMatch(html, /<iframe\b|<script\b|<blockquote\b|<video\b|instagram-media/);
  assert.ok(html.includes(`Swipe through all ${instagramReels.length} reels.`));
  for (const reel of instagramReels) {
    assert.equal(reel.href, `https://www.instagram.com/reel/${reel.id}/`);
    assert.ok(fs.existsSync(new URL(`../public${reel.poster}`, import.meta.url)));
    assert.ok(html.includes(encodeURIComponent(reel.poster)));
    assert.ok(html.includes(`aria-label="Watch ${reel.title}"`));
    assert.ok(reel.posterAlt.length > 10);
  }
  assert.match(html, /aria-label="Previous reels"/);
  assert.match(html, /aria-label="Next reels"/);
});

test("choosing a reel opens its index, navigation changes it, and close removes the viewer", () => {
  const harness = makeReelsHarness();
  const controls = harness.cards();
  assert.equal(controls.length, instagramReels.length);
  let openerFocused = false;
  controls[1].props.onClick({ currentTarget: { focus: () => { openerFocused = true; } } });
  assert.equal(openerFocused, true);
  let viewer = harness.viewer();
  assert.ok(viewer);
  assert.equal(viewer.props.index, 1);
  assert.equal(viewer.props.reels.length, instagramReels.length);
  assert.equal(viewer.props.children.type.name, "ReelVideoPlayer");
  assert.equal(viewer.props.children.props.src, instagramReels[1].videoSrc);
  assert.equal(viewer.props.children.props.muted, false);
  viewer.props.children.props.onMutedChange(true);
  const lastIndex = instagramReels.length - 1;
  viewer.props.onIndexChange(lastIndex);
  viewer = harness.viewer();
  assert.equal(viewer.props.children.props.src, instagramReels[lastIndex].videoSrc);
  assert.equal(viewer.props.children.props.muted, true);
  viewer.props.children.props.onMutedChange(false);
  viewer.props.onIndexChange(0);
  viewer = harness.viewer();
  assert.equal(viewer.props.children.props.muted, false);
  viewer.props.onClose();
  assert.equal(harness.viewer(), undefined);
  harness.cards()[lastIndex].props.onClick({ currentTarget: { focus: () => {} } });
  assert.equal(harness.viewer().props.index, lastIndex);
  harness.unmount();
});

test("preview arrows follow native scroll edges and resize, preserve motion preferences, and clean up", () => {
  const harness = makeReelsHarness();
  const list = elements(harness.tree).find((element) => element.type === "ul");
  assert.equal(harness.arrow("Previous reels").props.disabled, true);
  assert.equal(harness.arrow("Next reels").props.disabled, false);
  for (const label of ["Previous reels", "Next reels"]) assert.equal(harness.arrow(label).props["aria-controls"], list.props.id);
  harness.arrow("Next reels").props.onClick();
  assert.deepEqual(harness.scrolls.at(-1), { left: 308, behavior: "smooth" });
  assert.equal(harness.arrow("Previous reels").props.disabled, false);
  harness.scrollTo(harness.rail.scrollWidth - harness.rail.clientWidth);
  assert.equal(harness.arrow("Next reels").props.disabled, true);
  harness.reduceMotion();
  harness.arrow("Previous reels").props.onClick();
  assert.deepEqual(harness.scrolls.at(-1), { left: -308, behavior: "auto" });
  assert.equal(harness.arrow("Next reels").props.disabled, false);
  harness.resize(3000);
  assert.equal(harness.arrow("Previous reels").props.disabled, true);
  assert.equal(harness.arrow("Next reels").props.disabled, true);
  harness.unmount();
  assert.equal(harness.observers[0].disconnected, true);
  assert.equal(harness.listeners.size, 0);
});

test("embedded Instagram videos require optional-cookie consent and can be enabled explicitly", () => {
  let preference = "disabled";
  const choices = [];
  const load = createSourceLoader({ document: { activeElement: null }, require: (specifier) => {
    if (specifier === "react") return { ...React, useSyncExternalStore: (_subscribe, snapshot) => snapshot() };
    if (specifier === "@/lib/cookie-preferences") return {
      getCookiePreferenceSnapshot: () => preference,
      getCookiePreferenceServerSnapshot: () => "unset",
      subscribeToCookiePreferenceChanges: () => () => {},
      setCookiePreference: (value) => { choices.push(value); preference = value; },
    };
    return cssBoundary(specifier);
  } });
  const Embed = load("src/components/InstagramReelEmbed.tsx").default;
  for (const value of ["unset", "disabled"]) {
    preference = value;
    const tree = Embed({ reel: instagramReels[0] });
    assert.equal(elements(tree).some((element) => element.type === "iframe" || element.type === "script" || element.type === "blockquote"), false);
    const allow = elements(tree).find((element) => element.type === "button");
    assert.ok(allow);
    assert.equal(allow.props.children, "Allow optional cookies");
    allow.props.onClick({ currentTarget: {} });
    const enabled = Embed({ reel: instagramReels[0] });
    assert.equal(enabled.type.name, "EnabledReel");
    preference = "disabled";
    assert.equal(Embed({ reel: instagramReels[0] }).type, "div");
  }
  assert.deepEqual(choices, ["enabled", "enabled"]);
});

test("enabling consent hands focus to a surviving viewer control only when the removed button held focus", () => {
  let preference = "disabled";
  let closeFocusCount = 0;
  const document = { activeElement: null };
  const close = { focus: () => { closeFocusCount++; document.activeElement = close; } };
  const dialog = { querySelector: () => close };
  const allowButton = { closest: () => dialog };
  const activeAtEnable = [];
  const load = createSourceLoader({ document, require: (specifier) => {
    if (specifier === "react") return { ...React, useSyncExternalStore: (_subscribe, snapshot) => snapshot() };
    if (specifier === "@/lib/cookie-preferences") return {
      getCookiePreferenceSnapshot: () => preference,
      getCookiePreferenceServerSnapshot: () => "unset",
      subscribeToCookiePreferenceChanges: () => () => {},
      setCookiePreference: (value) => { activeAtEnable.push(document.activeElement); preference = value; },
    };
    return cssBoundary(specifier);
  } });
  const Embed = load("src/components/InstagramReelEmbed.tsx").default;
  const allow = () => elements(Embed({ reel: instagramReels[0] })).find((element) => element.type === "button");
  document.activeElement = allowButton;
  allow().props.onClick({ currentTarget: allowButton });
  assert.equal(document.activeElement, close);
  assert.equal(activeAtEnable[0], close);
  assert.equal(closeFocusCount, 1);

  preference = "disabled";
  const otherControl = {};
  document.activeElement = otherControl;
  allow().props.onClick({ currentTarget: allowButton });
  assert.equal(document.activeElement, otherControl);
  assert.equal(closeFocusCount, 1);
  preference = "enabled";
  Embed({ reel: instagramReels[0] });
  assert.equal(document.activeElement, otherControl);
  assert.equal(closeFocusCount, 1);
});

test("the existing profile and follow section remains before the reels in the footer", () => {
  const Footer = createSourceLoader({ require: cssBoundary })("src/components/SiteFooter.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Footer));
  assert.match(html, /Prime on Instagram/);
  assert.match(html, /Follow @primetacoshop/);
  assert.ok(html.indexOf("Prime on Instagram") < html.indexOf('aria-label="Prime Taco Shop reels"'));
});

test("reel embed owns its provider DOM, clears it on close, and ignores callbacks after consent is revoked", () => {
  let preference = "enabled";
  let processes = 0;
  const effects = [];
  const element = () => ({ children: [], dataset: {}, append(child) { this.children.push(child); }, replaceChildren() { this.children = []; } });
  const container = element();
  const load = createSourceLoader({
    window: { instgrm: { Embeds: { process: () => { processes++; } } } },
    document: { createElement: element },
    require: (specifier) => {
      if (specifier === "react") return {
        ...React,
        useRef: () => ({ current: container }),
        useState: (initial) => [initial, () => {}],
        useEffect: (callback) => { effects.push(callback); },
        useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
      };
      if (specifier === "@/lib/cookie-preferences") return {
        getCookiePreferenceSnapshot: () => preference,
        getCookiePreferenceServerSnapshot: () => "unset",
        subscribeToCookiePreferenceChanges: () => () => {},
      };
      return cssBoundary(specifier);
    },
  });
  const Embed = load("src/components/InstagramReelEmbed.tsx").default;
  const enabled = Embed({ reel: instagramReels[0] });
  const tree = enabled.type(enabled.props);
  const cleanups = effects.map((effect) => effect());
  assert.equal(container.children.length, 1);
  assert.equal(container.children[0].dataset.instgrmPermalink, instagramReels[0].href);
  assert.equal(processes, 1);
  const script = elements(tree).find((node) => node.props.src === "https://www.instagram.com/embed.js");
  assert.ok(script);
  assert.equal(script.props.onLoad, undefined);
  script.props.onReady();
  assert.equal(processes, 2);
  preference = "disabled";
  script.props.onReady();
  assert.equal(processes, 2);
  cleanups.forEach((cleanup) => cleanup?.());
  assert.equal(container.children.length, 0);
});
