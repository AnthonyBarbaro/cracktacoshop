import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader } from "./helpers.mjs";

function cssBoundary(specifier) {
  if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) };
  return undefined;
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement(node)) return [];
  return [node, ...elements(node.props.children)];
}

function makePlayerHarness({ blocked = false, blockUnmuted = false, failureName = "NotAllowedError", initiallyMuted = false } = {}) {
  let cursor = 0;
  let dirty = true;
  let effects = [];
  let tree;
  let source = "/videos/reels/prime-coronado.mp4";
  let playCount = 0;
  let pauseCount = 0;
  let loadCount = 0;
  let muted = initiallyMuted;
  const slots = [];
  const listeners = new Map();
  const document = {
    visibilityState: "visible",
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name, listener) => { if (listeners.get(name) === listener) listeners.delete(name); },
  };
  const video = {
    get src() { return source; },
    set src(value) { source = value; },
    getAttribute: (name) => name === "src" ? source : null,
    removeAttribute: (name) => { if (name === "src") source = null; },
    paused: true,
    ended: false,
    muted,
    currentTime: 0,
    play: () => {
      playCount++;
      if (blocked || (blockUnmuted && !video.muted)) {
        const error = new Error("Playback requires interaction");
        error.name = failureName;
        return Promise.reject(error);
      }
      video.paused = false;
      return Promise.resolve();
    },
    pause: () => { pauseCount++; video.paused = true; },
    load: () => { loadCount++; },
  };
  const hooks = {
    useRef: (initial) => { const index = cursor++; slots[index] ??= { value: { current: initial } }; return slots[index].value; },
    useState: (initial) => {
      const index = cursor++;
      slots[index] ??= { value: initial };
      return [slots[index].value, (value) => { if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; } }];
    },
    useEffect: (create, dependencies) => {
      const index = cursor++;
      const slot = slots[index];
      if (!slot || dependencies.some((value, offset) => !Object.is(value, slot.dependencies[offset]))) effects.push(() => {
        slot?.cleanup?.();
        slots[index] = { dependencies, create, cleanup: create() };
      });
    },
    useCallback: (callback, dependencies) => {
      const index = cursor++;
      const slot = slots[index];
      if (!slot || dependencies.some((value, offset) => !Object.is(value, slot.dependencies[offset]))) slots[index] = { value: callback, dependencies };
      return slots[index].value;
    },
  };
  const load = createSourceLoader({ document, require: (specifier) => specifier === "react" ? { ...React, ...hooks } : cssBoundary(specifier) });
  const Player = load("src/components/ReelVideoPlayer.tsx").default;
  const onMutedChange = (value) => { if (muted !== value) { muted = value; dirty = true; } };
  const flush = () => {
    while (dirty) {
      dirty = false;
      cursor = 0;
      effects = [];
      tree = Player({ src: "/videos/reels/prime-coronado.mp4", poster: "/images/reels/prime-coronado.webp", title: "Coronado moments", muted, onMutedChange });
      elements(tree).find((element) => element.type === "video").props.ref.current = video;
      effects.forEach((commit) => commit());
    }
    return tree;
  };
  flush();
  return {
    video, listeners, document, flush,
    get playCount() { return playCount; },
    get pauseCount() { return pauseCount; },
    get loadCount() { return loadCount; },
    get tree() { return flush(); },
    media: () => elements(flush()).find((element) => element.type === "video"),
    button: (label) => elements(flush()).find((element) => element.type === "button" && element.props["aria-label"] === label),
    replayEffect: () => slots.filter((slot) => slot.create).forEach((slot) => { slot.cleanup?.(); slot.cleanup = slot.create(); }),
    unmount: () => slots.forEach((slot) => slot.cleanup?.()),
  };
}

test("native reels start with sound enabled and use an inline first-party player with native controls", () => {
  const Player = createSourceLoader({ require: cssBoundary })("src/components/ReelVideoPlayer.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Player, { src: "/videos/reels/prime-coronado.mp4", poster: "/images/reels/prime-coronado.webp", title: "Coronado moments", muted: false, onMutedChange: () => {} }));
  assert.match(html, /<video[^>]*src="\/videos\/reels\/prime-coronado.mp4"/);
  for (const attribute of ["autoPlay", "playsInline", "controls"]) assert.ok(html.toLowerCase().includes(`${attribute.toLowerCase()}=""`));
  assert.doesNotMatch(html, / muted=""/);
  assert.match(html, /data-reel-gesture="true"/);
  assert.match(html, /aria-label="Play video"/);
  assert.match(html, /aria-label="Mute video"/);
  assert.doesNotMatch(html, /<iframe|<script|https:\/\//);
});

test("player requests playback on opening, reflects media events, and provides play/pause and sound controls", () => {
  const harness = makePlayerHarness();
  assert.equal(harness.playCount, 1);
  assert.equal(harness.video.muted, false);
  harness.media().props.onPlaying();
  harness.button("Pause video").props.onClick();
  assert.equal(harness.pauseCount, 1);
  harness.media().props.onPause();
  harness.button("Play video").props.onClick();
  assert.equal(harness.playCount, 2);
  harness.video.currentTime = 8.5;
  harness.button("Mute video").props.onClick();
  assert.equal(harness.video.muted, true);
  assert.ok(harness.button("Unmute video"));
  harness.button("Unmute video").props.onClick();
  assert.equal(harness.video.muted, false);
  assert.ok(harness.button("Mute video"));
  harness.video.muted = true;
  harness.media().props.onVolumeChange({ currentTarget: harness.video });
  assert.ok(harness.button("Unmute video"));
  assert.equal(harness.video.currentTime, 8.5);
  assert.equal(harness.playCount, 2);
  assert.equal(harness.loadCount, 0);
  harness.document.visibilityState = "hidden";
  harness.listeners.get("visibilitychange")();
  assert.equal(harness.pauseCount, 2);
  harness.unmount();
});

test("effect replay restores the media source, and final cleanup stops playback and releases its listener", () => {
  const harness = makePlayerHarness();
  harness.replayEffect();
  assert.equal(harness.video.getAttribute("src"), "/videos/reels/prime-coronado.mp4");
  assert.equal(harness.playCount, 2);
  assert.equal(harness.pauseCount, 1);
  assert.equal(harness.loadCount, 1);
  assert.equal(harness.listeners.size, 1);
  harness.unmount();
  assert.equal(harness.video.getAttribute("src"), null);
  assert.equal(harness.video.paused, true);
  assert.equal(harness.pauseCount, 2);
  assert.equal(harness.loadCount, 2);
  assert.equal(harness.listeners.size, 0);
});

test("blocked autoplay keeps an honest Play action and media errors retain a useful Instagram fallback", async () => {
  const harness = makePlayerHarness({ blocked: true });
  await new Promise(setImmediate);
  assert.ok(harness.button("Play video"));
  assert.equal(harness.video.paused, true);
  harness.media().props.onError({ currentTarget: harness.video });
  assert.ok(elements(harness.tree).some((element) => element.props.role === "status"));
  harness.media().props.onLoadStart();
  assert.equal(elements(harness.tree).some((element) => element.props.role === "status"), false);
  harness.video.removeAttribute("src");
  harness.media().props.onError({ currentTarget: harness.video });
  assert.equal(elements(harness.tree).some((element) => element.props.role === "status"), false);
  harness.unmount();
});

test("browser sound-policy rejection retries muted and reports the actual shared sound state", async () => {
  const harness = makePlayerHarness({ blockUnmuted: true });
  await new Promise(setImmediate);
  assert.equal(harness.playCount, 2);
  assert.equal(harness.video.muted, true);
  assert.equal(harness.video.paused, false);
  assert.ok(harness.button("Unmute video"));
  assert.equal(harness.loadCount, 0);
  harness.unmount();

  const interrupted = makePlayerHarness({ blockUnmuted: true, failureName: "AbortError" });
  await new Promise(setImmediate);
  assert.equal(interrupted.playCount, 1);
  assert.equal(interrupted.video.muted, false);
  assert.ok(interrupted.button("Mute video"));
  interrupted.unmount();
});
