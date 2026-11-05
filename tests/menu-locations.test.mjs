import assert from "node:assert/strict";
import { test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader } from "./helpers.mjs";

const { createElement, isValidElement } = React;

function createPageLoader(pathname, browser = {}, reactHooks) {
  return createSourceLoader({
    ...browser,
    require: (specifier) => {
      if (specifier === "react" && reactHooks) return { ...React, ...reactHooks };
      if (specifier === "next/navigation") return {
        usePathname: () => pathname,
        useRouter: () => ({ push() {} }),
        redirect: (destination) => { throw Object.assign(new Error("Redirect"), { destination }); },
        notFound: () => { throw Object.assign(new Error("Not found"), { notFound: true }); },
      };
      if (specifier.endsWith(".module.css")) {
        return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      }
      return undefined;
    },
  });
}

function getMainMarkup(html) {
  return html.slice(html.indexOf("<main"), html.indexOf("</main>") + "</main>".length);
}

function findElements(element, predicate) {
  if (Array.isArray(element)) return element.flatMap((child) => findElements(child, predicate));
  if (!isValidElement(element)) return [];
  return [
    ...(predicate(element) ? [element] : []),
    ...findElements(element.props.children, predicate),
  ];
}

function makeBrowserStorage() {
  const storage = new Map();
  const window = new EventTarget();
  window.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  class CustomEvent extends Event {
    constructor(name, options = {}) {
      super(name);
      this.detail = options.detail;
    }
  }
  return { window, storage, CustomEvent };
}

function makeMapHarness() {
  const browser = makeBrowserStorage();
  const hooks = [];
  let cursor = 0;
  const load = createPageLoader("/locations", browser, {
    useState: (initial) => {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = initial;
      return [hooks[index], (next) => { hooks[index] = typeof next === "function" ? next(hooks[index]) : next; }];
    },
    useRef: (initial) => {
      const index = cursor++;
      return hooks[index] ??= { current: initial };
    },
    useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
  });
  const Panel = load("src/components/LocationsMapPanel.tsx").default;
  const { locations } = load("src/data/locations.ts");
  return {
    ...browser,
    load,
    locations,
    shopping: load("src/lib/shopping-location.ts"),
    render: () => {
      cursor = 0;
      return Panel({ locations });
    },
  };
}

test("legacy menu entry redirects directly to the default Toast menu", () => {
  const load = createPageLoader("/menu");
  const MenuPage = load("src/app/menu/page.tsx").default;
  const { locations } = load("src/data/locations.ts");
  assert.throws(() => MenuPage(), (error) => error.destination === locations[0].toastUrl);
});

test("legacy location menus redirect to the matching Toast menu and reject unknown shops", async () => {
  const load = createPageLoader("/menu");
  const MenuPage = load("src/app/menu/[slug]/embed/page.tsx").default;
  const { locations } = load("src/data/locations.ts");
  for (const location of locations) {
    await assert.rejects(MenuPage({ params: Promise.resolve({ slug: location.slug }) }), (error) => error.destination === location.toastUrl);
  }
  await assert.rejects(MenuPage({ params: Promise.resolve({ slug: "unknown" }) }), (error) => error.notFound === true);
});

test("locations keeps a compact visit heading and includes every configured shop", () => {
  const load = createPageLoader("/locations");
  const LocationsPage = load("src/app/locations/page.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const main = getMainMarkup(renderToStaticMarkup(createElement(LocationsPage)));

  assert.match(main, /<h1[^>]*>Find your Prime\.<\/h1>/);
  assert.ok(main.indexOf("Plan your visit") < main.indexOf("Find your Prime."));
  assert.ok(main.indexOf("Find your Prime.") < main.indexOf("<article"));
  assert.doesNotMatch(main, /Hours may vary on holidays\.|Call your shop before visiting\./);
  assert.equal([...main.matchAll(/<article\b/g)].length, 4);
  assert.doesNotMatch(main, /<img\b|Our locations<\/h1>|Location Details|Shop details/);
  for (const location of locations) {
    assert.ok(main.includes(location.address));
    assert.match(main, new RegExp(`href="tel:${location.phone}"`));
    assert.ok(main.includes(location.hours));
    assert.ok(main.includes(`href="${location.toastUrl}"`));
  }
});

test("map location choices update the shared store, selected card, and map without optional storage", () => {
  const harness = makeMapHarness();
  const panelElement = harness.render();
  const selectionButtons = findElements(panelElement, (element) => element.type === "button" && "aria-pressed" in element.props);
  assert.equal(selectionButtons.length, 4);
  assert.equal(selectionButtons.filter((element) => element.props["aria-pressed"]).length, 1);
  let selectedSlug;
  harness.window.addEventListener(harness.shopping.SHOPPING_LOCATION_CHANGE_EVENT, (event) => {
    selectedSlug = event.detail.slug;
  });
  const coronadoButton = selectionButtons.find((element) => element.props["aria-label"] === "Show Coronado on the map");
  coronadoButton.props.onClick();

  assert.equal(selectedSlug, "coronado");
  assert.equal(harness.shopping.getShoppingLocationSlugSnapshot(), "coronado");
  assert.equal(harness.storage.has(harness.shopping.SHOPPING_LOCATION_STORAGE_KEY), false);
  const updated = harness.render();
  const selectedCard = findElements(updated, (element) => element.props.className === "selectedCard")[0];
  const coronado = harness.locations.find((location) => location.slug === "coronado");
  assert.equal(findElements(selectedCard, (element) => element.type === "h2")[0].props.children, coronado.name);
  assert.ok(findElements(selectedCard, (element) => element.type === "p").some((element) => element.props.children === coronado.address));
  assert.ok(findElements(selectedCard, (element) => element.type === "p").some((element) => element.props.children === coronado.hours));
  assert.equal(findElements(selectedCard, (element) => element.type === "a" && element.props.className === "order")[0].props.href, coronado.toastUrl);
  assert.equal(findElements(selectedCard, (element) => element.type === "a" && element.props.className === "call")[0].props.href, `tel:${coronado.phone}`);
  assert.equal(findElements(selectedCard, (element) => element.type?.name === "LocationOpenBadge")[0].props.slug, coronado.slug);
  const map = findElements(updated, (element) => element.type?.name === "GoogleMapEmbed")[0];
  const maps = harness.load("src/lib/google-maps.ts");
  assert.equal(map.props.src, maps.getGoogleMapsEmbedUrl({ address: coronado.address, placeId: coronado.placeId, apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() }));
});

test("mobile location disclosure closes on selection or Escape and restores focus to its control", () => {
  const harness = makeMapHarness();
  let focusCount = 0;
  const getToggle = (tree) => findElements(tree, (element) => element.type === "button" && element.props["aria-controls"] === "locations-list")[0];
  const toggle = getToggle(harness.render());
  toggle.props.ref.current = { focus: () => { focusCount++; } };
  assert.equal(toggle.props["aria-expanded"], false);
  toggle.props.onClick();

  const openTree = harness.render();
  assert.equal(getToggle(openTree).props["aria-expanded"], true);
  assert.equal(openTree.props["data-list-open"], true);
  const locationButton = findElements(openTree, (element) => element.props["aria-label"] === "Show Encinitas on the map")[0];
  locationButton.props.onClick();
  assert.equal(getToggle(harness.render()).props["aria-expanded"], false);
  assert.equal(harness.shopping.getShoppingLocationSlugSnapshot(), "encinitas");
  assert.equal(focusCount, 1);

  getToggle(harness.render()).props.onClick();
  const list = findElements(harness.render(), (element) => element.props.id === "locations-list")[0];
  let prevented = false;
  list.props.onKeyDown({ key: "Escape", preventDefault: () => { prevented = true; } });
  assert.equal(getToggle(harness.render()).props["aria-expanded"], false);
  assert.equal(prevented, true);
  assert.equal(focusCount, 2);

  getToggle(harness.render()).props.onClick();
  const reopenedList = findElements(harness.render(), (element) => element.props.id === "locations-list")[0];
  reopenedList.props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: {} });
  assert.equal(getToggle(harness.render()).props["aria-expanded"], false);
  assert.equal(focusCount, 2);
});

test("selected-shop actions use each shop's configured ordering and directions destinations", () => {
  const harness = makeMapHarness();
  const maps = harness.load("src/lib/google-maps.ts");
  for (const location of harness.locations) {
    harness.shopping.setStoredShoppingLocationSlug(location.slug);
    const card = findElements(harness.render(), (element) => element.props.className === "selectedCard")[0];
    const order = findElements(card, (element) => element.props.className === "order")[0];
    const directions = findElements(card, (element) => element.props.className === "directions")[0];
    assert.equal(order.props.href, location.toastUrl);
    assert.equal(order.props.target, undefined);
    assert.equal(directions.props.href, maps.getGoogleMapsDirectionsUrl(location));
  }
});

test("map retains its consent gate and a usable directions link before consent", () => {
  const load = createPageLoader("/locations");
  const Panel = load("src/components/LocationsMapPanel.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const html = renderToStaticMarkup(createElement(Panel, { locations }));

  assert.doesNotMatch(html, /<iframe\b/);
  assert.match(html, /allow Google Maps in cookie settings/);
  assert.match(html, /Cookie settings<\/button>/);
  assert.equal([...html.matchAll(/href="https:\/\/www\.google\.com\/maps\/dir\//g)].length, 5);
  assert.equal(renderToStaticMarkup(createElement(Panel, { locations: [] })), "");
});

test("maps remain blocked after opt-out and load the selected map only after consent", () => {
  const harness = makeMapHarness();
  const preferences = harness.load("src/lib/cookie-preferences.ts");
  const getMapOutput = () => {
    const map = findElements(harness.render(), (element) => element.type?.name === "GoogleMapEmbed")[0];
    return map.type(map.props);
  };
  assert.notEqual(getMapOutput().type, "iframe");
  preferences.setCookiePreference("disabled");
  assert.notEqual(getMapOutput().type, "iframe");
  harness.shopping.setStoredShoppingLocationSlug("coronado");
  assert.notEqual(getMapOutput().type, "iframe");
  preferences.setCookiePreference("enabled");
  assert.equal(getMapOutput().type, "iframe");
  assert.equal(getMapOutput().props.title, "Coronado map");
});
