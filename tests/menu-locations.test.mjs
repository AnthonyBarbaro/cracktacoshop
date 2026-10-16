import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader } from "./helpers.mjs";

function createPageLoader(pathname, browser = {}) {
  return createSourceLoader({
    ...browser,
    require: (specifier) => {
      if (specifier === "next/navigation") return { usePathname: () => pathname, useRouter: () => ({ push() {} }) };
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

test("menu entry offers only the four location menus in the requested order", () => {
  const load = createPageLoader("/menu");
  const MenuPage = load("src/app/menu/page.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const main = getMainMarkup(renderToStaticMarkup(createElement(MenuPage)));
  const links = [...main.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((match) => [match[1], match[2].replace(/<[^>]+>/g, "").trim()]);

  assert.deepEqual(links, [
    ["/menu/seaport-village/embed", "SEAPORT VILLAGE"],
    ["/menu/coronado/embed", "CORONADO"],
    ["/menu/encinitas/embed", "ENCINITAS"],
    ["/menu/mission-valley/embed", "MISSION VALLEY"],
  ]);
  assert.match(main, /Choose a location\./);
  assert.doesNotMatch(main, /<img\b|<iframe\b|\$\d|Favorites|View menu|Shop details/);
  for (const location of locations) {
    assert.equal(main.includes(location.address), false);
    assert.equal(main.includes(location.hours), false);
  }
});

test("locations starts with the requested visit heading and shows each shop once", () => {
  const load = createPageLoader("/locations");
  const LocationsPage = load("src/app/locations/page.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const main = getMainMarkup(renderToStaticMarkup(createElement(LocationsPage)));

  assert.match(main, /<h1[^>]*>Find your Prime\.<\/h1>/);
  assert.ok(main.indexOf("Plan your visit") < main.indexOf("Find your Prime."));
  assert.ok(main.indexOf("Find your Prime.") < main.indexOf("Hours may vary on holidays."));
  assert.ok(main.indexOf("Hours may vary on holidays.") < main.indexOf("<article"));
  assert.equal([...main.matchAll(/<article\b/g)].length, 4);
  assert.doesNotMatch(main, /<img\b|Our locations<\/h1>|Location Details|Shop details/);
  for (const location of locations) {
    assert.equal(main.split(location.address).length - 1, 1);
    assert.match(main, new RegExp(`href="tel:${location.phone}"`));
    assert.ok(main.includes(location.hours));
    assert.ok(main.includes(`href="${location.toastUrl}"`));
  }
});

test("location map selection buttons update the real store selection without optional storage", () => {
  const browser = makeBrowserStorage();
  const load = createPageLoader("/locations", browser);
  const Panel = load("src/components/LocationsMapPanel.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const shopping = load("src/lib/shopping-location.ts");
  let panelElement;
  function CapturePanel() {
    panelElement = Panel({ locations });
    return panelElement;
  }
  renderToStaticMarkup(createElement(CapturePanel));

  const selectionButtons = findElements(panelElement, (element) => element.type === "button");
  assert.equal(selectionButtons.length, 4);
  assert.equal(selectionButtons.filter((element) => element.props["aria-pressed"]).length, 1);
  let selectedSlug;
  browser.window.addEventListener(shopping.SHOPPING_LOCATION_CHANGE_EVENT, (event) => {
    selectedSlug = event.detail.slug;
  });
  const coronadoButton = selectionButtons.find((element) => element.props["aria-label"] === "Show Coronado on the map");
  coronadoButton.props.onClick();

  assert.equal(selectedSlug, "coronado");
  assert.equal(shopping.getShoppingLocationSlugSnapshot(), "coronado");
  assert.equal(browser.storage.has(shopping.SHOPPING_LOCATION_STORAGE_KEY), false);
});

test("map retains its consent gate and a usable directions link before consent", () => {
  const load = createPageLoader("/locations");
  const Panel = load("src/components/LocationsMapPanel.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const html = renderToStaticMarkup(createElement(Panel, { locations }));

  assert.doesNotMatch(html, /<iframe\b/);
  assert.match(html, /allow Google Maps in cookie settings/);
  assert.match(html, /Cookie settings<\/button>/);
  assert.equal([...html.matchAll(/href="https:\/\/www\.google\.com\/maps\/dir\//g)].length, 4);
  assert.equal(renderToStaticMarkup(createElement(Panel, { locations: [] })), "");
});
