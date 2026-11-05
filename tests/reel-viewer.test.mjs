import assert from "node:assert/strict";
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

function makeViewerHarness() {
  let cursor = 0;
  let nextId = 0;
  let effects = [];
  let tree;
  let props;
  let showCount = 0;
  let closeCount = 0;
  let closed = 0;
  const slots = [];
  const indices = [];
  const frames = new Map();
  let nextFrame = 0;
  const window = {
    requestAnimationFrame: (callback) => { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const document = { body: { style: { overflow: "clip" } }, activeElement: null };
  const body = { scrollTop: 0, scrollLeft: 0 };

  function control({ interactive = true, own = false, content = false, hidden = false, inert = false, gesture = false } = {}) {
    const captures = new Set();
    return {
      isConnected: true,
      tabIndex: 0,
      focusCount: 0,
      getClientRects: () => hidden ? [] : [{}],
      focus() { this.focusCount++; document.activeElement = this; },
      setPointerCapture: (id) => captures.add(id),
      hasPointerCapture: (id) => captures.has(id),
      releasePointerCapture: (id) => captures.delete(id),
      closest(selector) {
        if (selector === "[data-reel-gesture]") return gesture ? this : null;
        if (selector === "[data-reel-content]") return content ? this : null;
        if (selector.includes("[inert]")) return inert ? this : null;
        if (selector.startsWith("[data-reel-content],")) return content || interactive ? this : null;
        if (selector.includes("button")) return interactive ? this : null;
        return null;
      },
      hasAttribute: (name) => own && name === "data-reel-control",
    };
  }
  const opener = control();
  const close = control({ own: true });
  const frame = control({ content: true });
  const previous = control({ own: true });
  const watch = control();
  const next = control({ own: true });
  const hidden = control({ hidden: true });
  const inert = control({ inert: true });
  const dialog = {
    ...control({ interactive: false }),
    open: false,
    showModal() { this.open = true; showCount++; },
    close() { this.open = false; closeCount++; },
    getBoundingClientRect: () => ({ left: 20, top: 20, right: 400, bottom: 800 }),
    querySelectorAll: () => [close, frame, previous, watch, next, hidden, inert],
  };
  document.activeElement = opener;
  const hooks = {
    useRef: (initial) => {
      const index = cursor++;
      slots[index] ??= { value: { current: initial } };
      return slots[index].value;
    },
    useId: () => hooks.useRef(`viewer-test-${nextId++}`).current,
    useEffect: (create, dependencies) => {
      const index = cursor++;
      const slot = slots[index];
      if (!slot || dependencies.some((value, offset) => !Object.is(value, slot.dependencies[offset]))) effects.push(() => {
        slot?.cleanup?.();
        slots[index] = { dependencies, cleanup: create() };
      });
    },
  };
  const load = createSourceLoader({
    document, window,
    require: (specifier) => specifier === "react" ? { ...React, ...hooks } : cssBoundary(specifier),
  });
  const Viewer = load("src/components/ReelViewer.tsx").default;
  const render = (changes = {}) => {
    props = { reels: instagramReels, index: 0, onIndexChange: (index) => indices.push(index), onClose: () => { closed++; }, children: React.createElement("iframe", { title: "Official Instagram video" }), ...props, ...changes };
    cursor = 0;
    effects = [];
    tree = Viewer(props);
    if (tree) {
      tree.props.ref.current = dialog;
      elements(tree).find((element) => element.type === "button" && element.props.ref).props.ref.current = close;
      elements(tree).find((element) => element.props["data-reel-content"]).props.ref.current = body;
    }
    effects.forEach((commit) => commit());
    return tree;
  };
  render();

  return {
    render, dialog, document, body, opener, close, frame, previous, watch, next, indices, control, frames,
    get tree() { return tree; },
    get showCount() { return showCount; },
    get closeCount() { return closeCount; },
    get closed() { return closed; },
    button: (label) => elements(tree).find((element) => element.type === "button" && element.props["aria-label"] === label),
    keyDown: (key, target = dialog, modifiers = {}) => {
      let prevented = false;
      tree.props.onKeyDown({ key, currentTarget: dialog, target, preventDefault: () => { prevented = true; }, ...modifiers });
      return prevented;
    },
    unmount: () => slots.forEach((slot) => slot?.cleanup?.()),
  };
}

test("viewer exposes labelled dialog, current clip, official link, provider body, and navigation controls", () => {
  const Viewer = createSourceLoader({ require: cssBoundary })("src/components/ReelViewer.tsx").default;
  for (const [index, reel] of instagramReels.entries()) {
    const html = renderToStaticMarkup(React.createElement(Viewer, { reels: instagramReels, index, onIndexChange: () => {}, onClose: () => {} }, React.createElement("iframe", { title: "Official Instagram video" })));
    assert.match(html, /<dialog\b[^>]*aria-labelledby="[^"]+"[^>]*aria-describedby="[^"]+"/);
    assert.ok(html.includes(reel.title));
    assert.ok(html.includes(`${index + 1} / ${instagramReels.length}`));
    assert.ok(html.includes(`href="${reel.href}" target="_blank" rel="noopener noreferrer"`));
    assert.match(html, /<iframe title="Official Instagram video"/);
    for (const label of ["Close video", "Previous video", "Next video"]) assert.ok(html.includes(`aria-label="${label}"`));
    assert.equal([...html.matchAll(/<button\b/g)].length, 3);
    assert.doesNotMatch(html, /\bopen=/);
  }
});

test("dialog mounts once across clip changes and restores body overflow and the opening card on unmount", () => {
  const harness = makeViewerHarness();
  assert.equal(harness.showCount, 1);
  assert.equal(harness.document.body.style.overflow, "hidden");
  assert.equal(harness.document.activeElement, harness.close);
  harness.render({ index: 2 });
  assert.equal(harness.showCount, 1);
  assert.equal(harness.closeCount, 0);
  harness.unmount();
  assert.equal(harness.closeCount, 1);
  assert.equal(harness.document.body.style.overflow, "clip");
  assert.equal(harness.document.activeElement, harness.opener);
  assert.equal(harness.closed, 0);
});

test("changing clips resets provider scrolling while keeping dialog and navigation focus intact", () => {
  const harness = makeViewerHarness();
  harness.body.scrollTop = 700;
  harness.body.scrollLeft = 30;
  harness.document.activeElement = harness.next;
  harness.render({ index: 1 });
  assert.equal(harness.body.scrollTop, 0);
  assert.equal(harness.body.scrollLeft, 0);
  assert.equal(harness.document.activeElement, harness.next);
  assert.equal(harness.showCount, 1);
  assert.equal(harness.closeCount, 0);
  harness.body.scrollTop = 350;
  harness.render();
  assert.equal(harness.body.scrollTop, 350);
  harness.unmount();
});

test("previous, next, arrows, and Home/End wrap while leaving provider and link keys alone", () => {
  const harness = makeViewerHarness();
  const lastIndex = instagramReels.length - 1;
  harness.button("Previous video").props.onClick();
  assert.equal(harness.indices.at(-1), lastIndex);
  harness.render({ index: lastIndex });
  harness.button("Next video").props.onClick();
  assert.equal(harness.indices.at(-1), 0);
  harness.render({ index: 0 });
  assert.equal(harness.keyDown("ArrowLeft", harness.close), true);
  assert.equal(harness.indices.at(-1), lastIndex);
  assert.equal(harness.keyDown("ArrowRight", harness.next), true);
  assert.equal(harness.indices.at(-1), 1);
  assert.equal(harness.keyDown("End"), true);
  assert.equal(harness.indices.at(-1), lastIndex);
  assert.equal(harness.keyDown("Home"), true);
  assert.equal(harness.indices.at(-1), 0);
  const navigationCount = harness.indices.length;
  assert.equal(harness.keyDown("ArrowRight", harness.watch), false);
  assert.equal(harness.keyDown("Home", harness.frame), false);
  assert.equal(harness.keyDown("End", harness.dialog, { ctrlKey: true }), false);
  assert.equal(harness.keyDown("ArrowLeft", harness.dialog, { altKey: true }), false);
  assert.equal(harness.keyDown("ArrowRight", harness.dialog, { metaKey: true }), false);
  assert.equal(harness.keyDown("ArrowDown"), false);
  assert.equal(harness.indices.length, navigationCount);
});

test("Tab wraps visible controls at both ends without intercepting an iframe's normal position", () => {
  const harness = makeViewerHarness();
  harness.document.activeElement = harness.close;
  assert.equal(harness.keyDown("Tab", harness.close, { shiftKey: true }), true);
  assert.equal(harness.document.activeElement, harness.next);
  assert.equal(harness.keyDown("Tab", harness.next), true);
  assert.equal(harness.document.activeElement, harness.close);
  harness.document.activeElement = harness.frame;
  assert.equal(harness.keyDown("Tab", harness.frame), false);
  assert.equal(harness.document.activeElement, harness.frame);
});

test("Escape, cancel, native close, and close button notify once and cleanup restores focus", () => {
  const harness = makeViewerHarness();
  assert.equal(harness.keyDown("Escape", harness.frame), true);
  assert.equal(harness.closed, 1);
  assert.equal(harness.closeCount, 1);
  harness.tree.props.onClose({ currentTarget: harness.dialog });
  harness.button("Close video").props.onClick();
  assert.equal(harness.closed, 1);
  harness.unmount();
  assert.equal(harness.document.activeElement, harness.opener);

  const cancelled = makeViewerHarness();
  let prevented = false;
  cancelled.tree.props.onCancel({ preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(cancelled.closed, 1);
  cancelled.unmount();

  const native = makeViewerHarness();
  native.tree.props.onClose({ currentTarget: native.dialog });
  assert.equal(native.closed, 0);
  native.dialog.close();
  native.tree.props.onClose({ currentTarget: native.dialog });
  assert.equal(native.closed, 1);
  native.unmount();
});

test("backdrop closes only outside dialog bounds and disconnected opening cards are not refocused", () => {
  const harness = makeViewerHarness();
  const click = (target, clientX, clientY) => harness.tree.props.onClick({ target, currentTarget: harness.dialog, clientX, clientY });
  click(harness.dialog, 100, 100);
  click(harness.close, 0, 0);
  assert.equal(harness.closed, 0);
  click(harness.dialog, 0, 0);
  assert.equal(harness.closed, 1);
  harness.opener.isConnected = false;
  harness.unmount();
  assert.equal(harness.opener.focusCount, 0);
  assert.equal(harness.document.body.style.overflow, "clip");
});

test("video-surface swipes and mouse or pen drags navigate without stealing native controls or taps", () => {
  const harness = makeViewerHarness();
  const gesture = harness.control({ content: true, gesture: true });
  const start = (x, y, target = gesture, pointerType = "touch", isPrimary = true, button = 0) => harness.tree.props.onPointerDownCapture({ target, currentTarget: harness.dialog, clientX: x, clientY: y, pointerId: 1, pointerType, isPrimary, button });
  const end = (x, y) => harness.tree.props.onPointerUpCapture({ clientX: x, clientY: y, pointerId: 1 });
  for (const pointerType of ["touch", "pen", "mouse"]) {
    harness.document.activeElement = gesture;
    start(200, 100, gesture, pointerType);
    assert.equal(gesture.hasPointerCapture(1), true);
    end(140, 110);
    assert.equal(gesture.hasPointerCapture(1), false);
    assert.equal(harness.indices.at(-1), 1);
    assert.equal(harness.document.activeElement, harness.close);
  }
  start(100, 200);
  end(110, 140);
  assert.equal(harness.indices.at(-1), 1);
  start(100, 100);
  end(110, 160);
  assert.equal(harness.indices.at(-1), instagramReels.length - 1);
  let prevented = false;
  let stopped = false;
  harness.tree.props.onClickCapture({ preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
  assert.equal(prevented, true);
  assert.equal(stopped, true);
  const navigationCount = harness.indices.length;
  start(200, 100);
  end(140, 160);
  start(200, 100);
  end(160, 100);
  start(200, 100, harness.frame);
  end(100, 100);
  start(200, 100, harness.watch);
  end(100, 100);
  start(200, 100, gesture, "touch", false);
  end(100, 100);
  start(200, 100, gesture, "mouse", true, 2);
  end(100, 100);
  start(200, 100);
  harness.tree.props.onPointerCancel();
  assert.equal(gesture.hasPointerCapture(1), false);
  end(100, 100);
  assert.equal(harness.indices.length, navigationCount);
  start(100, 100);
  end(102, 101);
  prevented = false;
  harness.tree.props.onClickCapture({ preventDefault: () => { prevented = true; }, stopPropagation: () => {} });
  assert.equal(prevented, false);
  start(100, 100);
  end(20, 100);
  assert.equal(harness.frames.size, 1);
  start(100, 100);
  harness.unmount();
  assert.equal(gesture.hasPointerCapture(1), false);
  assert.equal(harness.frames.size, 0);
});

test("single reel disables cycling and empty reel collections render nothing", () => {
  const harness = makeViewerHarness();
  harness.render({ reels: [instagramReels[0]] });
  assert.equal(harness.button("Previous video").props.disabled, true);
  assert.equal(harness.button("Next video").props.disabled, true);
  harness.button("Next video").props.onClick();
  assert.equal(harness.indices.length, 0);
  harness.unmount();
  const Viewer = createSourceLoader({ require: cssBoundary })("src/components/ReelViewer.tsx").default;
  assert.equal(renderToStaticMarkup(React.createElement(Viewer, { reels: [], index: 0, onIndexChange: () => {}, onClose: () => {} }, null)), "");
});
