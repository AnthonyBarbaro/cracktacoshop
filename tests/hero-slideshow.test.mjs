import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader, loadSourceModule } from "./helpers.mjs";

const { heroFoodPhotos } = loadSourceModule("src/data/food-photos.ts");

function cssBoundary(specifier) {
  if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) };
  return undefined;
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement(node)) return [];
  return [node, ...elements(node.props.children)];
}

function makeSlideshowHarness({ reducedMotion = false, visible = true, inView = true } = {}) {
  const slots = [];
  const timers = new Map();
  const listeners = new Map();
  const motionListeners = new Set();
  const observers = [];
  const capturedPointers = new Set();
  const heroNode = {
    dataset: {},
    closest: () => null,
    setPointerCapture: (id) => capturedPointers.add(id),
    hasPointerCapture: (id) => capturedPointers.has(id),
    releasePointerCapture: (id) => capturedPointers.delete(id),
  };
  let cursor = 0;
  let pendingEffects = [];
  let dirty = true;
  let tree;
  let nextTimer = 0;

  const hooks = {
    useRef: (initial) => {
      const index = cursor++;
      slots[index] ??= { value: { current: initial } };
      return slots[index].value;
    },
    useState: (initial) => {
      const index = cursor++;
      slots[index] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slots[index].value, (next) => {
        const value = typeof next === "function" ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) {
          slots[index].value = value;
          dirty = true;
        }
      }];
    },
    useEffect: (create, dependencies) => {
      const index = cursor++;
      const slot = slots[index];
      if (!slot || dependencies.some((value, offset) => !Object.is(value, slot.dependencies[offset]))) {
        pendingEffects.push(() => {
          slot?.cleanup?.();
          slots[index] = { dependencies, cleanup: create() };
        });
      }
    },
    useSyncExternalStore: (subscribe, snapshot) => {
      hooks.useEffect(() => subscribe(() => { dirty = true; }), [subscribe]);
      return snapshot();
    },
  };
  const document = {
    visibilityState: visible ? "visible" : "hidden",
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name, listener) => { if (listeners.get(name) === listener) listeners.delete(name); },
  };
  const window = {
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout: (id) => timers.delete(id),
  };
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe(target) { this.target = target; this.callback([{ target, isIntersecting: inView }]); }
    disconnect() { this.disconnected = true; }
  }
  const load = createSourceLoader({
    window, document, IntersectionObserver,
    require: (specifier) => {
      if (specifier === "react") return { ...React, ...hooks };
      if (specifier === "@/lib/accessibility-preferences") return {
        getReducedMotionSnapshot: () => reducedMotion,
        getReducedMotionServerSnapshot: () => true,
        subscribeToReducedMotion: (listener) => { motionListeners.add(listener); return () => motionListeners.delete(listener); },
      };
      return cssBoundary(specifier);
    },
  });
  const Slideshow = load("src/components/HomeHeroSlideshow.tsx").default;

  const flush = () => {
    let renders = 0;
    while (dirty) {
      assert.ok(renders++ < 10, "slideshow state settles after effects");
      dirty = false;
      cursor = 0;
      pendingEffects = [];
      tree = Slideshow({ orderHref: "/order-online" });
      tree.props.ref.current = heroNode;
      pendingEffects.forEach((commit) => commit());
    }
    return tree;
  };
  const all = () => elements(flush());
  const selectors = () => all().filter((element) => element.props["data-hero-slide-control"]);
  const ready = (index) => { all().filter((element) => element.type.name === "FoodPhoto")[index].props.onLoad(); flush(); };
  flush();

  return {
    flush, timers, listeners, motionListeners, observers, heroNode, capturedPointers, selectors, ready,
    root: () => flush(),
    index: () => selectors().findIndex((button) => button.props["aria-pressed"]),
    readyAll: () => { heroFoodPhotos.forEach((_photo, index) => ready(index)); },
    tick: () => {
      assert.equal(timers.size, 1);
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      timer.callback();
      flush();
    },
    setReducedMotion: (value) => { reducedMotion = value; motionListeners.forEach((listener) => listener()); flush(); },
    setVisible: (value) => { document.visibilityState = value ? "visible" : "hidden"; listeners.get("visibilitychange")(); flush(); },
    setInView: (value) => { observers[0].callback([{ target: heroNode, isIntersecting: value }]); flush(); },
    keyDown: (key, target = heroNode, modifiers = {}) => {
      let prevented = false;
      flush().props.onKeyDown({ key, currentTarget: heroNode, target, preventDefault: () => { prevented = true; }, ...modifiers });
      flush();
      return prevented;
    },
    pointer: (phase, x, y, options = {}) => {
      let prevented = false;
      const handler = phase === "LostCapture" ? "onLostPointerCapture" : `onPointer${phase}`;
      flush().props[handler]({
        pointerType: "mouse", button: 0, isPrimary: true, pointerId: 1,
        clientX: x, clientY: y, currentTarget: heroNode, target: heroNode,
        preventDefault: () => { prevented = true; }, ...options,
      });
      flush();
      return prevented;
    },
    click: (detail = 1) => {
      let prevented = false;
      let stopped = false;
      flush().props.onClickCapture({ detail, preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
      return { prevented, stopped };
    },
    unmount: () => slots.forEach((slot) => slot?.cleanup?.()),
  };
}

test("hero renders four real food photos with the takeout spread third, one order action, source logo, and labelled controls on the server", () => {
  assert.deepEqual(Array.from(heroFoodPhotos, (photo) => photo.id), [
    "loaded-nachos-guacamole", "taco-three-salsas", "takeout-spread", "loaded-fries-fork",
  ]);
  const Slideshow = createSourceLoader({ require: cssBoundary })("src/components/HomeHeroSlideshow.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Slideshow, { orderHref: "https://order.toasttab.com/example" }));
  assert.match(html, /role="region" aria-roledescription="carousel" aria-label="Prime Tacos food photos"/);
  assert.equal([...html.matchAll(/aria-roledescription="slide"/g)].length, 4);
  assert.equal([...html.matchAll(/<button\b/g)].length, 4);
  assert.equal([...html.matchAll(/<a\b/g)].length, 1);
  assert.match(html, /href="https:\/\/order.toasttab.com\/example"/);
  assert.match(html, /Home of the<br\/>Tri-Tip Taco/);
  assert.match(html, /class="home-hero-logo"/);
  assert.doesNotMatch(html, /aria-label="(?:Play|Pause) slideshow"/);
  assert.match(html, /aria-live="polite"/);
  for (const photo of heroFoodPhotos) {
    assert.ok(html.includes(`src="${photo.src}"`), "hero serves the native-size WebP without recompressing it");
    assert.ok(html.includes(`alt="${photo.alt}"`));
  }
  assert.equal([...html.matchAll(/loading="lazy"/g)].length, 3);
  assert.doesNotMatch(html, /hero-tacos-elegant/);
});

test("automatic rotation waits for the next image and uses one seven-second timer at a time", () => {
  const harness = makeSlideshowHarness();
  assert.equal(harness.timers.size, 0);
  harness.ready(0);
  assert.equal(harness.timers.size, 0);
  harness.ready(1);
  assert.equal([...harness.timers.values()][0].delay, 7000);
  harness.tick();
  assert.equal(harness.index(), 1);
  assert.equal(harness.timers.size, 0);
  harness.readyAll();
  harness.tick();
  assert.equal(harness.index(), 2);
  harness.tick();
  assert.equal(harness.index(), 3);
  harness.tick();
  assert.equal(harness.index(), 0);
  assert.equal(harness.timers.size, 1);
  assert.match(harness.root().props.className, /playing/);
});

test("rotation stops offscreen, in hidden tabs, during mouse hover, and for either motion preference", () => {
  const harness = makeSlideshowHarness();
  harness.readyAll();
  harness.setInView(false);
  assert.equal(harness.timers.size, 0);
  harness.setInView(true);
  assert.equal(harness.timers.size, 1);
  harness.setVisible(false);
  assert.equal(harness.timers.size, 0);
  harness.setVisible(true);
  harness.root().props.onPointerEnter({ pointerType: "touch" });
  harness.flush();
  assert.equal(harness.timers.size, 1);
  harness.root().props.onPointerEnter({ pointerType: "mouse" });
  harness.flush();
  assert.equal(harness.timers.size, 0);
  assert.doesNotMatch(harness.root().props.className, /playing/);
  harness.root().props.onPointerLeave({ pointerType: "mouse" });
  harness.flush();
  assert.equal(harness.timers.size, 1);
  harness.setReducedMotion(true);
  assert.equal(harness.timers.size, 0);
  harness.setReducedMotion(false);
  assert.equal(harness.timers.size, 1);
});

test("focus and manual selection stop automatic rotation persistently without a play control", () => {
  const harness = makeSlideshowHarness();
  harness.readyAll();
  harness.root().props.onFocusCapture({ target: harness.heroNode });
  harness.flush();
  assert.equal(harness.timers.size, 0);
  harness.root().props.onPointerLeave({ pointerType: "mouse" });
  harness.flush();
  assert.equal(harness.timers.size, 0);
  harness.selectors()[2].props.onClick();
  harness.flush();
  assert.equal(harness.index(), 2);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.selectors()[2].props["aria-current"], "true");
  assert.equal(harness.selectors()[0].props["aria-current"], undefined);
  const status = elements(harness.root()).find((element) => element.props["aria-live"]);
  assert.equal(status.props["aria-live"], "polite");
});

test("keyboard navigation handles the carousel and selectors without capturing order-link shortcuts", () => {
  const harness = makeSlideshowHarness();
  assert.equal(harness.keyDown("ArrowLeft"), true);
  assert.equal(harness.index(), 3);
  assert.equal(harness.keyDown("ArrowRight", { dataset: { heroSlideControl: "true" } }), true);
  assert.equal(harness.index(), 0);
  assert.equal(harness.keyDown("End"), true);
  assert.equal(harness.index(), 3);
  assert.equal(harness.keyDown("Home"), true);
  assert.equal(harness.index(), 0);
  assert.equal(harness.keyDown("ArrowRight", { dataset: {} }), false);
  assert.equal(harness.keyDown("End", harness.heroNode, { ctrlKey: true }), false);
  assert.equal(harness.keyDown("ArrowDown"), false);
  assert.equal(harness.index(), 0);
});

test("touch swipes change photos without blocking vertical gestures or order controls", () => {
  const harness = makeSlideshowHarness();
  const start = (x, y, target = harness.heroNode) => harness.root().props.onTouchStart({ target, touches: [{ clientX: x, clientY: y }] });
  const end = (x, y) => { harness.root().props.onTouchEnd({ changedTouches: [{ clientX: x, clientY: y }] }); harness.flush(); };
  start(200, 100);
  end(140, 110);
  assert.equal(harness.index(), 1);
  start(100, 100);
  end(160, 110);
  assert.equal(harness.index(), 0);
  start(200, 100);
  end(140, 200);
  assert.equal(harness.index(), 0);
  start(200, 100, { closest: () => ({}) });
  end(100, 100);
  assert.equal(harness.index(), 0);
  start(200, 100);
  harness.root().props.onTouchCancel();
  end(100, 100);
  assert.equal(harness.index(), 0);
  harness.pointer("Down", 200, 100, { pointerType: "touch" });
  start(200, 100);
  end(100, 100);
  harness.pointer("Up", 100, 100, { pointerType: "touch" });
  assert.equal(harness.index(), 1);
  assert.equal(harness.capturedPointers.size, 0);
  harness.root().props.onTouchStart({ target: harness.heroNode, touches: [{ clientX: 200, clientY: 100 }, { clientX: 100, clientY: 100 }] });
  end(100, 100);
  assert.equal(harness.index(), 1);
});

test("mouse and pen drags capture the surface and change one photo per horizontal gesture", () => {
  const harness = makeSlideshowHarness();
  harness.readyAll();
  assert.equal(harness.pointer("Down", 200, 100), true);
  assert.equal(harness.capturedPointers.has(1), true);
  assert.match(harness.root().props.className, /dragging/);
  assert.equal(harness.timers.size, 0);
  harness.pointer("Move", 140, 110);
  harness.pointer("Move", 80, 110);
  assert.equal(harness.index(), 0);
  harness.pointer("Up", 80, 110);
  assert.equal(harness.index(), 1);
  assert.equal(harness.capturedPointers.size, 0);
  assert.doesNotMatch(harness.root().props.className, /dragging/);
  assert.equal(harness.timers.size, 0);
  harness.pointer("Down", 100, 100);
  harness.pointer("Up", 145, 110);
  assert.equal(harness.index(), 0);
  harness.pointer("Down", 100, 100, { pointerType: "pen" });
  harness.pointer("Up", 160, 110, { pointerType: "pen" });
  assert.equal(harness.index(), 3);
});

test("short, vertical, secondary, and interactive pointer gestures leave the current photo alone", () => {
  const harness = makeSlideshowHarness();
  harness.readyAll();
  for (const [x, y] of [[156, 100], [140, 200], [155, 145]]) {
    harness.pointer("Down", 200, 100);
    harness.pointer("Up", x, y);
    assert.equal(harness.index(), 0);
    assert.equal(harness.timers.size, 1);
  }
  for (const options of [{ button: 1 }, { button: 2 }, { isPrimary: false }, { pointerType: "touch" }, { target: { closest: () => ({}) } }]) {
    assert.equal(harness.pointer("Down", 200, 100, options), false);
    assert.equal(harness.capturedPointers.size, 0);
    harness.pointer("Move", 100, 100, options);
    harness.pointer("Up", 100, 100, options);
    assert.equal(harness.index(), 0);
    assert.equal(harness.timers.size, 1);
  }
});

test("pointer cancellation and lost capture clear the gesture without changing photos", () => {
  const harness = makeSlideshowHarness();
  harness.readyAll();
  for (const phase of ["Cancel", "LostCapture"]) {
    harness.pointer("Down", 200, 100);
    harness.pointer("Move", 100, 100);
    if (phase === "LostCapture") harness.capturedPointers.delete(1);
    harness.pointer(phase, 100, 100);
    assert.equal(harness.capturedPointers.size, 0);
    assert.doesNotMatch(harness.root().props.className, /dragging/);
    harness.pointer("Up", 100, 100);
    assert.equal(harness.index(), 0);
    assert.equal(harness.timers.size, 1);
    assert.deepEqual(harness.click(), { prevented: false, stopped: false });
  }
});

test("dragging blocks native image dragging and its follow-up click while controls remain clickable", () => {
  const harness = makeSlideshowHarness();
  let nativeDragPrevented = false;
  const nativeDrag = () => harness.root().props.onDragStart({ preventDefault: () => { nativeDragPrevented = true; } });
  nativeDrag();
  assert.equal(nativeDragPrevented, false);
  harness.pointer("Down", 200, 100);
  nativeDrag();
  assert.equal(nativeDragPrevented, true);
  harness.pointer("Up", 100, 100);
  assert.deepEqual(harness.click(), { prevented: true, stopped: true });
  assert.deepEqual(harness.click(), { prevented: false, stopped: false });
  harness.pointer("Down", 200, 100);
  harness.pointer("Up", 100, 100);
  assert.deepEqual(harness.click(0), { prevented: false, stopped: false });
  harness.pointer("Down", 200, 100);
  harness.pointer("Up", 100, 100);
  assert.equal(harness.pointer("Down", 100, 100, { target: { closest: () => ({}) } }), false);
  assert.deepEqual(harness.click(), { prevented: false, stopped: false });
  harness.selectors()[2].props.onClick();
  harness.flush();
  assert.equal(harness.index(), 2);
  assert.equal(harness.timers.size, 0);
});

test("unmount clears timer, visibility listener, observer, and motion subscription", () => {
  const harness = makeSlideshowHarness();
  harness.readyAll();
  assert.equal(harness.timers.size, 1);
  assert.equal(harness.listeners.size, 1);
  assert.equal(harness.motionListeners.size, 1);
  harness.unmount();
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.listeners.size, 0);
  assert.equal(harness.motionListeners.size, 0);
  assert.equal(harness.observers[0].disconnected, true);
});
