import assert from "node:assert/strict";
import test from "node:test";

import { createSourceLoader } from "./helpers.mjs";

const nonScrollInputs = ["wheel", "pointermove", "pointerdown", "touchstart", "keydown"];

function eventHub() {
  const listeners = new Map();
  const options = new Map();
  return {
    listeners, options,
    addEventListener(name, callback, settings) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
      options.set(name, settings);
    },
    removeEventListener(name, callback) {
      listeners.get(name)?.delete(callback);
      if (!listeners.get(name)?.size) listeners.delete(name);
    },
    emit(name) { [...(listeners.get(name) ?? [])].forEach((callback) => callback()); },
  };
}

function makeLogoHarness({ reducedMotion = false, scrollY = 0 } = {}) {
  let setup;
  let time = 0;
  let nextId = 0;
  let fontReady;
  let srcWrites = 0;
  const timers = new Map();
  const frames = new Map();
  const motionListeners = new Set();
  const observers = [];
  const sourceBounds = { left: 70, top: 220, width: 250, height: 155 };
  const targetBounds = { left: 20, top: 20, width: 106, height: 66 };
  const window = {
    ...eventHub(), scrollY,
    visualViewport: eventHub(),
    setTimeout: (callback, delay) => { const id = ++nextId; timers.set(id, { callback, at: time + delay, delay }); return id; },
    clearTimeout: (id) => timers.delete(id),
    requestAnimationFrame: (callback) => { const id = ++nextId; frames.set(id, callback); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const fonts = { ...eventHub(), ready: new Promise((resolve) => { fontReady = resolve; }) };
  function image(attributes) {
    const attrs = new Map(Object.entries(attributes));
    const style = { visibility: "", removeProperty(name) { this[name] = ""; } };
    return {
      ...eventHub(), attrs, style, removed: false,
      get src() { return attrs.get("src") ?? ""; },
      set src(value) { attrs.set("src", value); srcWrites++; },
      getAttribute: (name) => attrs.get(name) ?? null,
      setAttribute: (name, value) => attrs.set(name, value),
      removeAttribute: (name) => attrs.delete(name),
      remove() { this.removed = true; },
    };
  }
  const source = image({ src: "/newlogo.png", class: "home-hero-logo", width: "3822", height: "2378", sizes: "280px", srcset: "/newlogo.png 1x" });
  source.currentSrc = "/newlogo.png";
  source.getBoundingClientRect = () => ({ ...sourceBounds, top: sourceBounds.top - window.scrollY });
  let clone;
  source.cloneNode = () => { clone = image(Object.fromEntries(source.attrs)); return clone; };
  const target = image({ src: "/newlogo.png" });
  target.getBoundingClientRect = () => ({ ...targetBounds });
  const document = { fonts, querySelector: () => target, body: { append() {} } };
  class ResizeObserver {
    constructor(callback) { this.callback = callback; this.observed = []; this.disconnected = false; observers.push(this); }
    observe(element) { this.observed.push(element); }
    disconnect() { this.disconnected = true; }
  }
  const load = createSourceLoader({
    window, document, ResizeObserver, performance: { now: () => time },
    require: (specifier) => {
      if (specifier === "react") return { useRef: () => ({ current: source }), useLayoutEffect: (callback) => { setup = callback; } };
      if (specifier === "@/lib/accessibility-preferences") return {
        getReducedMotionSnapshot: () => reducedMotion,
        subscribeToReducedMotion: (callback) => { motionListeners.add(callback); return () => motionListeners.delete(callback); },
      };
      return undefined;
    },
  });
  load("src/components/HomeLogoIntro.tsx").default();
  const cleanup = setup();

  return {
    window, fonts, source, target, clone, frames, timers, observers, motionListeners, sourceBounds, targetBounds,
    get srcWrites() { return srcWrites; },
    docked: () => target.attrs.has("data-home-logo-docked"),
    emit: (name) => window.emit(name),
    scrollTo: (y) => { window.scrollY = y; window.emit("scroll"); },
    advance: (elapsed) => {
      time += elapsed;
      for (const [id, timer] of [...timers]) if (timer.at <= time) { timers.delete(id); timer.callback(); }
    },
    frame: (elapsed) => {
      time += elapsed;
      const callbacks = [...frames];
      frames.clear();
      callbacks.forEach(([, callback]) => callback(time));
    },
    position: () => {
      const [, x, y] = clone.style.transform.match(/translate3d\(([^p]+)px, ([^p]+)px/);
      return { x: Number(x), y: Number(y), width: Number.parseFloat(clone.style.width), height: Number.parseFloat(clone.style.height) };
    },
    reduceMotion: () => { reducedMotion = true; [...motionListeners].forEach((callback) => callback()); },
    finishFonts: () => fontReady(),
    unmount: cleanup,
  };
}

test("logo stays in place until six seconds, then makes one timed flight and remains docked", () => {
  const harness = makeLogoHarness();
  assert.equal([...harness.timers.values()][0].delay, 6000);
  assert.equal(harness.source.style.visibility, "visible");
  assert.equal(harness.source.attrs.has("data-home-logo-docked"), false);
  assert.equal(harness.clone.style.display, "none");
  assert.equal(harness.clone.src, "");
  harness.advance(5999);
  assert.equal(harness.frames.size, 0);
  assert.equal(harness.docked(), false);
  harness.advance(1);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.frames.size, 1);
  assert.equal(harness.source.style.visibility, "hidden");
  assert.equal(harness.clone.style.display, "block");
  assert.equal(harness.docked(), false);
  harness.frame(799);
  assert.equal(harness.docked(), false);
  assert.equal(harness.source.attrs.has("data-home-logo-docked"), false);
  harness.frame(1);
  assert.equal(harness.docked(), true);
  assert.equal(harness.source.attrs.has("data-home-logo-docked"), true);
  assert.equal(harness.clone.style.display, "none");
  assert.equal(harness.frames.size, 0);
  harness.window.scrollY = 0;
  harness.emit("scroll");
  harness.emit("pointermove");
  harness.advance(10000);
  assert.equal(harness.source.style.visibility, "hidden");
  assert.equal(harness.docked(), true);
  assert.equal(harness.frames.size, 0);
  harness.unmount();
  assert.equal(harness.source.attrs.has("data-home-logo-docked"), false);
});

test("only downward scrolling starts early; pointer, tap, key, wheel, upward, and unchanged input do not", () => {
  const harness = makeLogoHarness({ scrollY: 100 });
  assert.equal(harness.window.options.get("scroll").passive, true);
  for (const name of nonScrollInputs) {
    assert.equal(harness.window.listeners.has(name), false);
    harness.emit(name);
  }
  harness.advance(1000);
  harness.scrollTo(100);
  harness.scrollTo(80);
  harness.scrollTo(80);
  harness.scrollTo(-10);
  harness.scrollTo(0);
  harness.emit("resize");
  harness.source.emit("load");
  harness.fonts.emit("loadingdone");
  assert.equal(harness.frames.size, 0);
  assert.equal(harness.timers.size, 1);
  assert.equal(harness.source.style.visibility, "visible");
  harness.scrollTo(1);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.frames.size, 1);
  assert.equal(harness.window.listeners.has("scroll"), false);
  harness.scrollTo(10);
  assert.equal(harness.frames.size, 1);
  harness.frame(800);
  harness.scrollTo(0);
  assert.equal(harness.docked(), true);
  assert.equal(harness.frames.size, 0);
  harness.unmount();
});

test("a rapid scroll uses current viewport coordinates and cannot leave the clone over following text", () => {
  const harness = makeLogoHarness();
  harness.scrollTo(120);
  harness.frame(16);
  const position = harness.position();
  const sourceTop = harness.sourceBounds.top - harness.window.scrollY;
  const headingTop = harness.sourceBounds.top + harness.sourceBounds.height + 24 - harness.window.scrollY;
  assert.ok(position.y <= sourceTop);
  assert.ok(position.y + position.height < headingTop);
  assert.ok(position.width <= harness.sourceBounds.width && position.width >= harness.targetBounds.width);
  assert.ok(position.height < 200, "intrinsic image dimensions never determine the visible clone size");
  harness.frame(784);
  assert.equal(harness.docked(), true);
  harness.unmount();

  const restored = makeLogoHarness({ scrollY: 200 });
  restored.emit("scroll");
  assert.equal(restored.frames.size, 0);
  restored.scrollTo(201);
  assert.equal(restored.position().y, 19);
  restored.unmount();
});

test("in-flight resize, image, and font changes use fresh geometry without duplicate animation frames", async () => {
  const harness = makeLogoHarness();
  harness.scrollTo(1);
  harness.window.scrollY = 120;
  Object.assign(harness.sourceBounds, { left: 40, top: 260, width: 300, height: 186 });
  Object.assign(harness.targetBounds, { left: 10, top: 16, width: 120, height: 74.4 });
  harness.emit("resize");
  harness.window.visualViewport.emit("resize");
  harness.observers[0].callback();
  harness.source.currentSrc = "/newlogo-loaded.png";
  harness.source.emit("load");
  harness.target.emit("load");
  harness.fonts.emit("loadingdone");
  harness.finishFonts();
  await Promise.resolve();
  assert.equal(harness.frames.size, 1);
  harness.frame(400);
  const position = harness.position();
  assert.equal(position.width, 210);
  assert.equal(position.x, 25);
  assert.equal(position.y, 54);
  assert.equal(harness.clone.src, "/newlogo-loaded.png");
  assert.equal(harness.srcWrites, 2);
  harness.frame(16);
  assert.equal(harness.srcWrites, 2, "unchanged image sources are not reassigned every frame");
  harness.unmount();
});

test("reduced motion docks on the trigger and a preference change finishes an active flight", () => {
  const reduced = makeLogoHarness({ reducedMotion: true });
  reduced.advance(5999);
  assert.equal(reduced.docked(), false);
  reduced.scrollTo(1);
  assert.equal(reduced.docked(), true);
  assert.equal(reduced.clone.style.display, "none");
  assert.equal(reduced.frames.size, 0);
  assert.equal(reduced.timers.size, 0);
  reduced.unmount();

  const running = makeLogoHarness();
  running.scrollTo(1);
  assert.equal(running.frames.size, 1);
  running.reduceMotion();
  assert.equal(running.docked(), true);
  assert.equal(running.frames.size, 0);
  running.unmount();
});

test("completion and unmount release timers, frames, observers, font callbacks, and input listeners", async () => {
  for (const started of [false, true]) {
    const harness = makeLogoHarness();
    if (started) harness.scrollTo(1);
    harness.unmount();
    assert.equal(harness.timers.size, 0);
    assert.equal(harness.frames.size, 0);
    assert.equal(harness.window.listeners.size, 0);
    assert.equal(harness.window.visualViewport.listeners.size, 0);
    assert.equal(harness.source.listeners.size, 0);
    assert.equal(harness.target.listeners.size, 0);
    assert.equal(harness.fonts.listeners.size, 0);
    assert.equal(harness.motionListeners.size, 0);
    assert.equal(harness.observers[0].disconnected, true);
    assert.equal(harness.clone.removed, true);
    assert.equal(harness.source.style.visibility, "");
    assert.equal(harness.docked(), false);
    harness.finishFonts();
    await Promise.resolve();
    harness.advance(10000);
    assert.equal(harness.frames.size, 0);
    assert.equal(harness.docked(), false);
  }
  const completed = makeLogoHarness();
  completed.scrollTo(1);
  completed.frame(800);
  assert.equal(completed.window.listeners.size, 0);
  assert.equal(completed.motionListeners.size, 0);
  assert.equal(completed.observers[0].disconnected, true);
  completed.unmount();
});
