import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader, loadSourceModule } from "./helpers.mjs";

const { foodPhotos } = loadSourceModule("src/data/food-photos.ts");

function cssBoundary(specifier) {
  if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) };
  return undefined;
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement(node)) return [];
  return [node, ...elements(node.props.children)];
}

function makeRailHarness() {
  let reducedMotion = false;
  let nextId = 0;
  let groupWidth = 2000;
  let cursor = 0;
  let pendingEffects = [];
  let dirty = true;
  let tree;
  const slots = [];
  const calls = [];
  const animations = [];
  const scrollWrites = [];
  const trace = [];
  const windowListeners = new Map();
  const documentListeners = new Map();
  const motionListeners = new Set();
  const intersectionObservers = [];
  const resizeObservers = [];
  let scrollPosition = 0;
  const rail = {
    clientWidth: 400,
    get scrollLeft() { return scrollPosition; },
    set scrollLeft(value) { scrollWrites.push(value); trace.push("scrollLeft"); scrollPosition = value; },
    scrollBy: (options) => { trace.push("scrollBy"); calls.push({ method: "scrollBy", ...options }); rail.scrollLeft += options.left; },
    scrollTo: (options) => { trace.push("scrollTo"); calls.push({ method: "scrollTo", ...options }); rail.scrollLeft = options.left; },
  };
  const track = {
    animate: (keyframes, options) => {
      const animation = {
        currentTime: 0,
        cancelled: false,
        cancel() { trace.push("cancel"); this.cancelled = true; this.currentTime = null; },
      };
      animations.push({ animation, keyframes, options });
      return animation;
    },
  };
  const group = { getBoundingClientRect: () => ({ width: groupWidth }) };
  const rotation = {};
  const hooks = {
    useRef: (initial) => {
      const index = cursor++;
      slots[index] ??= { value: { current: initial } };
      return slots[index].value;
    },
    useId: () => hooks.useRef(`rail-test-${nextId++}`).current,
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
      if (!slot || dependencies.some((value, offset) => !Object.is(value, slot.dependencies[offset]))) pendingEffects.push(() => {
        slot?.cleanup?.();
        slots[index] = { dependencies, cleanup: create() };
      });
    },
    useSyncExternalStore: (subscribe, snapshot) => {
      hooks.useEffect(() => subscribe(() => { dirty = true; }), [subscribe]);
      return snapshot();
    },
  };
  const document = {
    visibilityState: "visible",
    addEventListener: (name, listener) => documentListeners.set(name, listener),
    removeEventListener: (name, listener) => { if (documentListeners.get(name) === listener) documentListeners.delete(name); },
  };
  const window = {
    addEventListener: (name, listener) => windowListeners.set(name, listener),
    removeEventListener: (name, listener) => { if (windowListeners.get(name) === listener) windowListeners.delete(name); },
  };
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.disconnected = false; intersectionObservers.push(this); }
    observe(target) { this.target = target; this.callback([{ target, isIntersecting: true }]); }
    disconnect() { this.disconnected = true; }
  }
  class ResizeObserver {
    constructor(callback) { this.callback = callback; this.disconnected = false; resizeObservers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const load = createSourceLoader({
    window, document, IntersectionObserver, ResizeObserver,
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
  const render = load("src/components/FoodPhotoRail.tsx").default;
  const flush = () => {
    let renders = 0;
    while (dirty) {
      assert.ok(renders++ < 10, "rail state settles after effects");
      dirty = false;
      cursor = 0;
      pendingEffects = [];
      tree = render();
      elements(tree).find((element) => element.props.role === "region").props.ref.current = rail;
      elements(tree).find((element) => element.props["data-photo-track"]).props.ref.current = track;
      elements(tree).find((element) => element.props["data-photo-group"] === "original").props.ref.current = group;
      elements(tree).find((element) => element.type === "button" && element.props.ref).props.ref.current = rotation;
      pendingEffects.forEach((commit) => commit());
    }
    return tree;
  };
  const region = () => elements(flush()).find((element) => element.props.role === "region");
  flush();

  return {
    get tree() { return flush(); },
    get region() { return region(); },
    get buttons() { return elements(flush()).filter((element) => element.type === "button"); },
    get activeAnimations() { return animations.filter(({ animation }) => !animation.cancelled); },
    get motion() {
      const motion = animations.findLast(({ animation }) => !animation.cancelled);
      assert.ok(motion);
      return motion;
    },
    calls, rail, animations, scrollWrites, trace, flush, rotation, windowListeners, documentListeners, motionListeners, intersectionObservers, resizeObservers,
    reduceMotion: (value = true) => { reducedMotion = value; motionListeners.forEach((listener) => listener()); flush(); },
    keyDown: (key, modifiers = {}) => {
      let prevented = false;
      region().props.onKeyDown({ key, currentTarget: rail, target: rail, preventDefault: () => { prevented = true; }, ...modifiers });
      flush();
      return prevented;
    },
    setInView: (value) => { intersectionObservers[0].callback([{ target: rail, isIntersecting: value }]); flush(); },
    setVisible: (value) => { document.visibilityState = value ? "visible" : "hidden"; documentListeners.get("visibilitychange")(); flush(); },
    resize: (width) => { groupWidth = width; resizeObservers[0].callback(); flush(); },
    unmount: () => slots.forEach((slot) => slot?.cleanup?.()),
  };
}

test("food rail renders every new photo with descriptive alternatives and no visible captions", () => {
  const Rail = createSourceLoader({ require: cssBoundary })("src/components/FoodPhotoRail.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Rail));
  assert.match(html, /aria-label="Prime Tacos food gallery"/);
  assert.equal([...html.matchAll(/<img\b/g)].length, 27);
  assert.equal([...html.matchAll(/alt=""/g)].length, 18);
  assert.equal([...html.matchAll(/aria-hidden="true" inert=""/g)].length, 2);
  assert.equal([...html.matchAll(/role="list"/g)].length, 1);
  for (const photo of foodPhotos) {
    assert.ok(html.includes(encodeURIComponent(photo.src)));
    assert.equal(html.split(`alt="${photo.alt}"`).length - 1, 1);
  }
  assert.doesNotMatch(html, /<(?:h[1-6]|p|figcaption|a)\b/);
  assert.doesNotMatch(html, /aria-live/);
});

test("rail preserves each full photo or safe screenshot frame and labels keyboard controls", () => {
  const { tree, region, buttons } = makeRailHarness();
  const originalGroup = elements(tree).find((element) => element.props["data-photo-group"] === "original");
  const figures = elements(originalGroup).filter((element) => element.type === "figure");
  assert.equal(figures.length, foodPhotos.length);
  figures.forEach((figure, index) => {
    const photo = foodPhotos[index];
    const frame = photo.frame ?? photo;
    assert.equal(figure.props.style["--photo-ratio"], frame.width / frame.height);
    assert.equal(figure.props.children.props.photo.id, photo.id);
    const renderedFrame = figure.props.children.props.photo.frame;
    assert.deepEqual(renderedFrame ? { ...renderedFrame } : undefined, photo.frame ? { ...photo.frame } : undefined);
  });
  assert.equal(region.props.tabIndex, 0);
  assert.equal(region.props["aria-label"], "Scrollable food photos");
  assert.deepEqual(buttons.map((button) => button.props["aria-label"]), ["Show previous food photos", "Show next food photos", "Pause photo scrolling"]);
  for (const button of buttons) assert.equal(button.props["aria-controls"], region.props.id);
});

test("previous and next controls scroll by most of the visible rail and honor motion changes", () => {
  const harness = makeRailHarness();
  harness.buttons[1].props.onClick();
  harness.buttons[0].props.onClick();
  assert.deepEqual(harness.calls, [
    { method: "scrollBy", left: 300, behavior: "smooth" },
    { method: "scrollBy", left: -300, behavior: "smooth" },
  ]);
  harness.reduceMotion();
  harness.buttons[1].props.onClick();
  assert.deepEqual(harness.calls.at(-1), { method: "scrollBy", left: 300, behavior: "auto" });
});

test("focused rail supports arrows and Home/End without intercepting unrelated keys or shortcuts", () => {
  const harness = makeRailHarness();
  for (const key of ["ArrowRight", "ArrowLeft", "End", "Home"]) assert.equal(harness.keyDown(key), true);
  assert.deepEqual(harness.calls, [
    { method: "scrollBy", left: 300, behavior: "smooth" },
    { method: "scrollBy", left: -300, behavior: "smooth" },
    { method: "scrollTo", left: 3600, behavior: "smooth" },
    { method: "scrollTo", left: 2000, behavior: "smooth" },
  ]);
  assert.equal(harness.keyDown("ArrowDown"), false);
  assert.equal(harness.keyDown("Tab"), false);
  assert.equal(harness.keyDown("Home", { ctrlKey: true }), false);
  assert.equal(harness.keyDown("ArrowLeft", { altKey: true }), false);
  assert.equal(harness.keyDown("End", { metaKey: true }), false);
  assert.equal(harness.keyDown("ArrowRight", { target: {} }), false);
  assert.equal(harness.calls.length, 4);
  harness.reduceMotion();
  harness.keyDown("End");
  assert.deepEqual(harness.calls.at(-1), { method: "scrollTo", left: 3600, behavior: "auto" });
});

test("automatic belt animates one transform at 28 pixels per second without per-frame scrolling", () => {
  const harness = makeRailHarness();
  assert.equal(harness.rail.scrollLeft, 2000);
  assert.equal(harness.activeAnimations.length, 1);
  const { animation, keyframes, options } = harness.motion;
  assert.deepEqual(Array.from(keyframes, (frame) => frame.transform), ["translate3d(0, 0, 0)", "translate3d(-2000px, 0, 0)"]);
  assert.equal(options.duration, 2000 / 28 * 1000);
  assert.equal(options.iterations, Infinity);
  assert.equal(options.easing, "linear");
  const writes = harness.scrollWrites.length;
  animation.currentTime = options.duration * 2 + 500;
  assert.equal(harness.rail.scrollLeft, 2000);
  assert.equal(harness.scrollWrites.length, writes);
  harness.buttons[2].props.onClick();
  harness.flush();
  assert.ok(Math.abs(harness.rail.scrollLeft - 2014) < .001);
  assert.equal(harness.activeAnimations.length, 0);
});

test("manual movement commits the visible offset before native scrolling and still normalizes boundaries", () => {
  const harness = makeRailHarness();
  harness.motion.animation.currentTime = 1000;
  harness.trace.length = 0;
  harness.buttons[1].props.onClick();
  harness.flush();
  assert.equal(harness.rail.scrollLeft, 2328);
  assert.deepEqual(harness.trace, ["cancel", "scrollLeft", "scrollBy", "scrollLeft"]);
  assert.equal(harness.activeAnimations.length, 0);
  harness.buttons[2].props.onClick();
  harness.flush();
  harness.rail.scrollLeft = 3999;
  harness.motion.animation.currentTime = 50;
  harness.region.props.onPointerDown();
  harness.flush();
  assert.ok(Math.abs(harness.rail.scrollLeft - 2000.4) < .001);
  harness.rail.scrollLeft = 1990;
  harness.region.props.onScroll();
  assert.equal(harness.rail.scrollLeft, 3990);
  harness.buttons[2].props.onClick();
  harness.flush();
  harness.motion.animation.currentTime = null;
  harness.region.props.onWheel({ deltaX: 10 });
  harness.flush();
  assert.equal(harness.rail.scrollLeft, 2000);
});

test("resize preserves the logical photo position instead of jumping to a new sequence", () => {
  const harness = makeRailHarness();
  harness.rail.scrollLeft = 2500;
  harness.motion.animation.currentTime = 1000;
  const previousMotion = harness.motion;
  harness.resize(4000);
  assert.equal(harness.rail.scrollLeft, 4000);
  assert.ok(Math.abs(harness.motion.animation.currentTime / 1000 * 28 - 1056) < .001);
  assert.equal(previousMotion.animation.cancelled, true);
  assert.equal(harness.activeAnimations.length, 1);
  assert.equal(harness.motion.options.duration, 4000 / 28 * 1000);
  const currentMotion = harness.motion;
  harness.resize(4000);
  assert.equal(harness.motion, currentMotion);
});

test("resuming uses animation phase within one group so the duplicate tail cannot run out", () => {
  const harness = makeRailHarness();
  harness.buttons[2].props.onClick();
  harness.flush();
  harness.rail.scrollLeft = 3900;
  harness.buttons[2].props.onClick();
  harness.flush();
  assert.equal(harness.rail.scrollLeft, 2000);
  assert.ok(Math.abs(harness.motion.animation.currentTime / 1000 * 28 - 1900) < .001);
  harness.motion.animation.currentTime += 10000;
  harness.buttons[2].props.onClick();
  harness.flush();
  assert.ok(Math.abs(harness.rail.scrollLeft - 2180) < .001);
});

test("hover, viewport, hidden-tab, and reduced-motion pauses cancel and resume native animation", () => {
  const harness = makeRailHarness();
  harness.tree.props.onPointerEnter({ pointerType: "mouse" });
  harness.flush();
  assert.equal(harness.activeAnimations.length, 0);
  harness.tree.props.onPointerLeave({ pointerType: "mouse" });
  harness.flush();
  assert.equal(harness.activeAnimations.length, 1);
  harness.setInView(false);
  assert.equal(harness.activeAnimations.length, 0);
  harness.setInView(true);
  harness.setVisible(false);
  assert.equal(harness.activeAnimations.length, 0);
  harness.setVisible(true);
  assert.equal(harness.activeAnimations.length, 1);
  harness.reduceMotion();
  assert.equal(harness.activeAnimations.length, 0);
  assert.equal(harness.buttons[2].props.disabled, true);
  harness.reduceMotion(false);
  assert.equal(harness.activeAnimations.length, 1);
});

test("entering the viewport never creates image preloads for the below-fold belt", () => {
  const harness = makeRailHarness();
  const photos = () => elements(harness.tree).filter((element) => element.type.name === "FoodPhoto");
  for (const visible of [true, false, true]) {
    harness.setInView(visible);
    assert.equal(photos().length, 27);
    assert.ok(photos().every((photo) => !photo.props.priority));
  }
});

test("focus and native manual interaction pause until explicit Play, with all resources cleaned up", () => {
  const harness = makeRailHarness();
  harness.tree.props.onFocusCapture({ target: harness.rail });
  harness.flush();
  assert.equal(harness.activeAnimations.length, 0);
  harness.tree.props.onFocusCapture({ target: harness.rotation });
  harness.buttons[2].props.onClick();
  harness.flush();
  assert.equal(harness.activeAnimations.length, 1);
  harness.region.props.onPointerDown();
  harness.flush();
  assert.equal(harness.activeAnimations.length, 0);
  harness.buttons[2].props.onClick();
  harness.flush();
  assert.equal(harness.activeAnimations.length, 1);
  harness.region.props.onWheel({ deltaX: 0 });
  harness.flush();
  assert.equal(harness.activeAnimations.length, 1);
  harness.region.props.onWheel({ deltaX: 10 });
  harness.flush();
  assert.equal(harness.activeAnimations.length, 0);
  harness.buttons[2].props.onClick();
  harness.flush();
  harness.unmount();
  assert.equal(harness.activeAnimations.length, 0);
  assert.equal(harness.windowListeners.size, 0);
  assert.equal(harness.documentListeners.size, 0);
  assert.equal(harness.motionListeners.size, 0);
  assert.equal(harness.intersectionObservers[0].disconnected, true);
  assert.equal(harness.resizeObservers[0].disconnected, true);
});
