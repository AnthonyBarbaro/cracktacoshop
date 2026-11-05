import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";

import { createSourceLoader, loadSourceModule } from "./helpers.mjs";

const { locations } = loadSourceModule("src/data/locations.ts");

function makeQuickOrderHarness() {
  const storage = new Map();
  const browserWindow = new EventTarget();
  browserWindow.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  class BrowserCustomEvent extends Event {
    constructor(name, options = {}) {
      super(name);
      this.detail = options.detail;
    }
  }
  let nextId = 0;
  const load = createSourceLoader({
    window: browserWindow,
    CustomEvent: BrowserCustomEvent,
    require: (specifier) => {
      if (specifier === "react") return {
        ...React,
        useId: () => `quick-order-test-${nextId++}`,
        useRef: (current) => ({ current }),
        useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
      };
      if (specifier === "next/navigation") return { usePathname: () => "/" };
      if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) };
      return undefined;
    },
  });
  return {
    render: load("src/components/QuickOrderPanel.tsx").default,
    shopping: load("src/lib/shopping-location.ts"),
    preferences: load("src/lib/cookie-preferences.ts"),
    delivery: load("src/lib/delivery-options.ts"),
    storage,
    window: browserWindow,
  };
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement(node)) return [];
  return [node, ...elements(node.props.children)];
}

function findElement(node, type) {
  return elements(node).find((element) => element.type === type);
}

test("quick ordering labels all four shops and gives repeated instances unique selector IDs", () => {
  const harness = makeQuickOrderHarness();
  const first = harness.render();
  const second = harness.render();
  const select = findElement(first, "select");
  assert.equal(first.props.role, "group");
  assert.equal(first.props["aria-label"], "Order online");
  assert.equal(findElement(first, "label").props.htmlFor, select.props.id);
  assert.notEqual(select.props.id, findElement(second, "select").props.id);
  assert.equal(select.props.value, "");
  assert.deepEqual(elements(select).filter((element) => element.type === "option").map((option) => option.props.value), ["", ...locations.map((location) => location.slug)]);
  assert.equal(findElement(select, "option").props.disabled, true);
});

test("first-visit pickup focuses location selection instead of choosing a shop for the guest", () => {
  const harness = makeQuickOrderHarness();
  const tree = harness.render();
  const select = findElement(tree, "select");
  let focused = false;
  select.props.ref.current = { focus: () => { focused = true; } };
  findElement(tree, "button").props.onClick();
  assert.equal(focused, true);
  assert.equal(findElement(tree, "a"), undefined);
  assert.equal(harness.shopping.getShoppingLocationSlugSnapshot(), "");
});

test("pickup opens each selected shop’s exact Toast menu in the current tab", () => {
  const harness = makeQuickOrderHarness();
  for (const location of locations) {
    findElement(harness.render(), "select").props.onChange({ target: { value: location.slug } });
    const tree = harness.render();
    const pickup = findElement(tree, "a");
    assert.equal(findElement(tree, "select").props.value, location.slug);
    assert.equal(pickup.props.href, location.toastUrl);
    assert.equal(pickup.props.target, undefined);
    assert.equal(pickup.props["aria-label"], `Order pickup from ${location.name}`);
  }
  const lastLocation = locations[locations.length - 1];
  findElement(harness.render(), "select").props.onChange({ target: { value: "unknown-shop" } });
  assert.equal(findElement(harness.render(), "a").props.href, lastLocation.toastUrl);
});

test("delivery opens the existing drawer with the selected shop", () => {
  const harness = makeQuickOrderHarness();
  let selectedSlug;
  harness.window.addEventListener(harness.delivery.OPEN_DELIVERY_OPTIONS_EVENT, (event) => { selectedSlug = event.detail.slug; });
  for (const location of locations) {
    harness.shopping.setStoredShoppingLocationSlug(location.slug);
    const delivery = elements(harness.render()).find((element) => typeof element.type === "function" && element.type.name === "DeliveryButton");
    const button = delivery.type(delivery.props);
    assert.equal(button.props["aria-controls"], "mobile-site-menu");
    assert.equal(button.props["aria-haspopup"], "dialog");
    button.props.onClick();
    assert.equal(selectedSlug, location.slug);
  }
});

test("quick-order selection respects optional cookie storage consent", () => {
  const harness = makeQuickOrderHarness();
  harness.preferences.setCookiePreference("disabled");
  findElement(harness.render(), "select").props.onChange({ target: { value: "coronado" } });
  assert.equal(harness.shopping.getShoppingLocationSlugSnapshot(), "coronado");
  assert.equal(harness.storage.has(harness.shopping.SHOPPING_LOCATION_STORAGE_KEY), false);
  harness.preferences.setCookiePreference("enabled");
  findElement(harness.render(), "select").props.onChange({ target: { value: "encinitas" } });
  assert.equal(harness.storage.get(harness.shopping.SHOPPING_LOCATION_STORAGE_KEY), "encinitas");
});
