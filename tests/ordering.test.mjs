import assert from "node:assert/strict";
import { test } from "node:test";

import { createSourceLoader, loadSourceModule } from "./helpers.mjs";
const { locations } = loadSourceModule("src/data/locations.ts");

test("menu links stay on the site while pickup destinations remain available", () => {
  const { getMenuHref } = loadSourceModule("src/lib/menu-link.ts");
  assert.equal(getMenuHref(), "/menu");

  for (const location of locations) {
    assert.equal(getMenuHref(location), `/menu/${location.slug}/embed`);
    assert.equal(new URL(location.toastUrl).hostname, "order.toasttab.com");
  }

  assert.equal(getMenuHref({ slug: "example", toastUrl: "https://example.com/order" }), "/menu/example/embed");
});

test("each shop keeps its own menu prices and identifies printed reference prices", () => {
  const { getMenuForLocation, getFlattenedMenuItems } = loadSourceModule("src/data/menu.ts");
  const findItem = (slug, name) => getFlattenedMenuItems(getMenuForLocation(slug).sections)
    .find((item) => item.name === name);

  assert.equal(findItem("mission-valley", "Prime (Tri-Tip) Burrito").price, "$15.25");
  assert.equal(findItem("seaport-village", "Tri-Tip Burrito").price, "$18.95");
  assert.equal(findItem("encinitas", "Tri-Tip Burrito").price, "$17.95");
  for (const slug of ["seaport-village", "encinitas"]) {
    const menu = getMenuForLocation(slug);
    assert.equal(menu.priceSource, "printed-menu");
    assert.equal(new URL(menu.printedMenuUrl).hostname, "cracktacoshop.com");
    assert.ok(menu.notes.some((note) => note.includes("Confirm current prices")));
  }
  assert.equal(getMenuForLocation("coronado").sections.length, 0);
  assert.equal(getMenuForLocation("coronado").priceSource, "location-menu-link");
});

test("printed taco prices distinguish one taco from two at each shop", () => {
  const { getMenuForLocation, getFlattenedMenuItems } = loadSourceModule("src/data/menu.ts");
  const taco = (slug) => getFlattenedMenuItems(getMenuForLocation(slug).sections)
    .find((item) => item.name === "Tri-Tip Taco");

  const options = (item) => [...item.priceOptions].map((option) => [option.label, option.price]);
  assert.deepEqual(options(taco("seaport-village")), [["1 taco", "$6.95"], ["2 tacos", "$12.95"]]);
  assert.deepEqual(options(taco("encinitas")), [["1 taco", "$6.75"], ["2 tacos", "$12.00"]]);
  assert.equal(taco("seaport-village").price, "$6.95");
  assert.equal(taco("encinitas").price, "$6.75");
});

test("menu category anchors match the available sections and unknown shops never inherit prices", () => {
  const { getMenuForLocation } = loadSourceModule("src/data/menu.ts");
  for (const location of locations) {
    const menu = getMenuForLocation(location.slug);
    const sectionIds = [...menu.sections].map((section) => section.id);
    assert.equal(new Set(sectionIds).size, sectionIds.length);
    assert.deepEqual([...menu.nav].map((link) => link.sectionId), sectionIds);
  }
  for (const slug of ["unknown", "constructor", "toString"]) {
    const menu = getMenuForLocation(slug);
    assert.equal(menu.sections.length, 0);
    assert.equal(menu.nav.length, 0);
    assert.equal(menu.hasLocationSpecificPricing, false);
  }
});

test("directions start routing to the exact existing place instead of showing its listing", () => {
  const { getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl } = loadSourceModule("src/lib/google-maps.ts");

  for (const location of locations) {
    const url = new URL(getGoogleMapsDirectionsUrl(location));
    assert.equal(url.pathname, "/maps/dir/");
    assert.equal(url.searchParams.get("destination"), location.address);
    assert.equal(url.searchParams.get("destination_place_id"), location.placeId);
    assert.equal(url.searchParams.get("api"), "1");
    assert.equal(getGoogleMapsSearchUrl(location), location.googleMapsUrl);
  }

  const url = new URL(getGoogleMapsDirectionsUrl({ address: "A & B, California", origin: "  San Diego & Coronado  " }));
  assert.equal(url.searchParams.get("origin"), "San Diego & Coronado");
  assert.equal(url.searchParams.get("destination"), "A & B, California");
  assert.equal(url.searchParams.has("destination_place_id"), false);
});

test("open badges respect opening and closing times, midnight, and Pacific daylight saving time", async (t) => {
  const { getIsLocationOpenNow } = loadSourceModule("src/lib/location-hours.ts");
  const cases = [
    ["mission-valley", "2026-10-12T06:59:00Z", true],
    ["mission-valley", "2026-10-12T07:00:00Z", false],
    ["mission-valley", "2026-10-12T07:30:00Z", false],
    ["mission-valley", "2026-10-12T13:59:00Z", false],
    ["mission-valley", "2026-10-12T14:00:00Z", true],
    ["seaport-village", "2026-10-12T07:30:00Z", true],
    ["seaport-village", "2026-10-12T08:59:00Z", true],
    ["seaport-village", "2026-10-12T09:00:00Z", false],
    ["seaport-village", "2026-10-12T14:00:00Z", true],
    ["encinitas", "2026-10-12T14:59:00Z", false],
    ["encinitas", "2026-10-12T15:00:00Z", true],
    ["encinitas", "2026-10-13T05:59:00Z", true],
    ["encinitas", "2026-10-13T06:00:00Z", false],
    ["coronado", "2026-10-12T07:30:00Z", true],
    ["coronado", "2026-10-12T09:00:00Z", false],
    ["coronado", "2026-10-12T15:00:00Z", true],
    ["seaport-village", "2026-11-01T08:30:00Z", true],
    ["seaport-village", "2026-11-01T09:30:00Z", true],
    ["seaport-village", "2026-11-01T10:00:00Z", false],
    ["mission-valley", "2026-12-12T08:30:00Z", false],
    ["mission-valley", "2026-12-12T15:00:00Z", true],
    ["seaport-village", "2026-03-08T09:30:00Z", true],
    ["seaport-village", "2026-03-08T10:00:00Z", false],
  ];

  for (const [slug, date, expected] of cases) {
    await t.test(`${slug} at ${date}`, () => assert.equal(getIsLocationOpenNow(slug, new Date(date)), expected));
  }
  assert.equal(getIsLocationOpenNow("unknown"), null);
});

test("restaurant hours schema has all days and usable time values", () => {
  const { getLocationOpeningHoursSpecification } = loadSourceModule("src/lib/location-hours.ts");
  const expectedHours = {
    "mission-valley": ["07:00", "00:00"],
    "seaport-village": ["07:00", "02:00"],
    encinitas: ["08:00", "23:00"],
    coronado: ["08:00", "02:00"],
  };

  for (const location of locations) {
    const schema = getLocationOpeningHoursSpecification(location.slug);
    assert.equal(schema["@type"], "OpeningHoursSpecification");
    assert.deepEqual([...schema.dayOfWeek], ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
    assert.deepEqual([schema.opens, schema.closes], expectedHours[location.slug]);
  }
  assert.equal(getLocationOpeningHoursSpecification("unknown"), undefined);
});

test("nearest-store selection handles empty, invalid, antipodal, and tied coordinates", () => {
  const { findNearestLocationSlug: nearest } = loadSourceModule("src/lib/shopping-location.ts");
  assert.equal(nearest(32, -117, []), undefined);
  for (const location of locations) assert.equal(nearest(location.latitude, location.longitude, locations), location.slug);
  assert.equal(nearest(NaN, -117, locations), undefined);
  assert.equal(nearest(91, -117, locations), undefined);
  assert.equal(nearest(32, -181, locations), undefined);
  assert.equal(nearest(0, Infinity, locations), undefined);
  assert.equal(nearest(32, -117, [{ slug: "bad", latitude: NaN, longitude: 0 }, { slug: "good", latitude: 32, longitude: -117 }]), "good");
  assert.equal(nearest(32, -117, [{ slug: "bad", latitude: NaN, longitude: 0 }]), undefined);
  assert.equal(nearest(0, 0, [{ slug: "antipode", latitude: 0, longitude: 180 }]), "antipode");
  assert.equal(nearest(0, 0, [{ slug: "first", latitude: 0, longitude: 0 }, { slug: "second", latitude: 0, longitude: 0 }]), "first");
});

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
  return { storage, window, CustomEvent };
}

test("store choice persists only with consent and remains usable during the current visit", () => {
  const browser = makeBrowserStorage();
  const load = createSourceLoader(browser);
  const preferences = load("src/lib/cookie-preferences.ts");
  const shopping = load("src/lib/shopping-location.ts");
  const stop = shopping.subscribeToShoppingLocationChanges(() => {});

  assert.equal(preferences.getCookiePreferenceSnapshot(), "unset");
  shopping.setStoredShoppingLocationSlug("mission-valley");
  assert.equal(browser.storage.has(shopping.SHOPPING_LOCATION_STORAGE_KEY), false);
  assert.equal(shopping.getStoredShoppingLocationSlug(), "mission-valley");
  preferences.setCookiePreference("enabled");
  assert.equal(browser.storage.get(shopping.SHOPPING_LOCATION_STORAGE_KEY), "mission-valley");
  shopping.setStoredShoppingLocationSlug("encinitas");
  assert.equal(browser.storage.get(shopping.SHOPPING_LOCATION_STORAGE_KEY), "encinitas");
  preferences.setCookiePreference("disabled");
  assert.equal(browser.storage.has(shopping.SHOPPING_LOCATION_STORAGE_KEY), false);
  assert.equal(shopping.getStoredShoppingLocationSlug(), "encinitas");
  assert.equal(createSourceLoader(browser)("src/lib/shopping-location.ts").getStoredShoppingLocationSlug(), undefined);
  stop();
});

test("store selection follows storage changes from another tab", () => {
  const browser = makeBrowserStorage();
  const load = createSourceLoader(browser);
  const preferences = load("src/lib/cookie-preferences.ts");
  const shopping = load("src/lib/shopping-location.ts");
  let updates = 0;
  const stop = shopping.subscribeToShoppingLocationChanges(() => { updates++; });
  preferences.setCookiePreference("enabled");
  shopping.setStoredShoppingLocationSlug("encinitas");

  browser.storage.set(shopping.SHOPPING_LOCATION_STORAGE_KEY, "coronado");
  const changed = new Event("storage");
  changed.key = shopping.SHOPPING_LOCATION_STORAGE_KEY;
  changed.newValue = "coronado";
  browser.window.dispatchEvent(changed);
  assert.equal(shopping.getStoredShoppingLocationSlug(), "coronado");
  assert.equal(updates, 3);

  browser.storage.clear();
  const cleared = new Event("storage");
  cleared.key = null;
  browser.window.dispatchEvent(cleared);
  assert.equal(shopping.getStoredShoppingLocationSlug(), undefined);
  stop();
});

test("blocked browser storage does not break consent or store selection", () => {
  const browser = makeBrowserStorage();
  const blocked = () => { throw new Error("Storage blocked"); };
  browser.window.localStorage = { getItem: blocked, setItem: blocked, removeItem: blocked };
  const load = createSourceLoader(browser);
  const preferences = load("src/lib/cookie-preferences.ts");
  const shopping = load("src/lib/shopping-location.ts");

  preferences.setCookiePreference("disabled");
  shopping.setStoredShoppingLocationSlug("coronado");
  assert.equal(preferences.getCookiePreferenceSnapshot(), "disabled");
  assert.equal(shopping.getStoredShoppingLocationSlug(), "coronado");
});

test("ZIP lookup validates input and handles provider failures without guessing a store", async () => {
  let payload = { places: [{ latitude: String(locations[0].latitude), longitude: String(locations[0].longitude) }] };
  let status = 200;
  let requestCount = 0;
  const load = createSourceLoader({ fetch: async () => {
    requestCount++;
    return { status, ok: status === 200, json: async () => payload };
  } });
  const { findNearestLocationFromZipCode: zip } = load("src/lib/zip-location.ts");

  assert.equal((await zip("92108", locations)).slug, "mission-valley");
  assert.equal((await zip(" 92108 ", locations)).slug, "mission-valley");
  assert.equal((await zip("abcde", locations)).reason, "invalid-zip");
  assert.equal((await zip("92108", [])).reason, "no-match");
  status = 404;
  assert.equal((await zip("00000", locations)).reason, "not-found");
  status = 500;
  assert.equal((await zip("92108", locations)).reason, "unavailable");
  status = 200;
  payload = { places: [{ latitude: "999", longitude: "-117" }] };
  assert.equal((await zip("92108", locations)).reason, "unavailable");
  payload = { places: [{ latitude: "", longitude: "-117" }] };
  assert.equal((await zip("92108", locations)).reason, "unavailable");
  payload = { places: [] };
  assert.equal((await zip("92108", locations)).reason, "not-found");
  payload = { invalid: true };
  assert.equal((await zip("92108", locations)).reason, "unavailable");
  const controller = new AbortController();
  controller.abort();
  const before = requestCount;
  assert.equal((await zip("92108", locations, controller.signal)).reason, "cancelled");
  assert.equal(requestCount, before);
});

test("ZIP lookup aborts in-flight work when its caller cancels", async () => {
  let startRequest;
  const started = new Promise((resolve) => { startRequest = resolve; });
  const { findNearestLocationFromZipCode: zip } = loadSourceModule("src/lib/zip-location.ts", {
    fetch: (url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("Aborted")), { once: true });
      startRequest(url);
    }),
  });
  const controller = new AbortController();
  const result = zip("92108", locations, controller.signal);
  assert.equal(await started, "https://api.zippopotam.us/us/92108");
  controller.abort();
  assert.equal((await result).reason, "cancelled");
});

test("ZIP provider timeouts are reported separately from cancellation", async () => {
  const { findNearestLocationFromZipCode: zip } = loadSourceModule("src/lib/zip-location.ts", {
    setTimeout: (callback) => { queueMicrotask(callback); return 1; },
    clearTimeout: () => {},
    fetch: (url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("Timed out")), { once: true });
    }),
  });
  assert.equal((await zip("92108", locations)).reason, "timeout");
});

test("geolocation failure modes provide useful fallback results", async () => {
  const { findNearestLocationFromBrowser } = loadSourceModule("src/lib/nearest-location.ts");
  assert.equal((await findNearestLocationFromBrowser(locations)).reason, "unsupported");
  assert.equal((await findNearestLocationFromBrowser([])).reason, "no-match");

  let geolocationCalls = 0;
  const denied = loadSourceModule("src/lib/nearest-location.ts", {
    window: {},
    navigator: {
      permissions: { query: async () => ({ state: "denied" }) },
      geolocation: { getCurrentPosition: () => { geolocationCalls++; } },
    },
  });
  assert.equal((await denied.findNearestLocationFromBrowser(locations)).reason, "permission-denied");
  assert.equal(geolocationCalls, 0);

  const permissionError = { code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3 };
  const refused = loadSourceModule("src/lib/nearest-location.ts", {
    window: {},
    navigator: { geolocation: { getCurrentPosition: (success, failure) => failure(permissionError) } },
  });
  assert.equal((await refused.findNearestLocationFromBrowser(locations)).reason, "permission-denied");

  let attempts = 0;
  const retried = loadSourceModule("src/lib/nearest-location.ts", {
    window: {},
    navigator: { geolocation: { getCurrentPosition: (success, failure) => {
      attempts++;
      if (attempts === 1) failure({ code: 3, PERMISSION_DENIED: 1, TIMEOUT: 3 });
      else success({ coords: { latitude: locations[3].latitude, longitude: locations[3].longitude } });
    } } },
  });
  assert.equal((await retried.findNearestLocationFromBrowser(locations)).slug, "coronado");
  assert.equal(attempts, 2);
});
