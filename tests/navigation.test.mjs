import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader } from "./helpers.mjs";

function createPageLoader(pathname, selectedLocation) {
  return createSourceLoader({
    require: (specifier) => {
      if (specifier === "next/navigation") return { usePathname: () => pathname, useRouter: () => ({ push: () => {} }) };
      if (specifier === "@/lib/use-shopping-location") return { useShoppingLocation: () => selectedLocation };
      if (specifier === "@/lib/shopping-location") {
        return {
          getShoppingLocationSlugSnapshot: () => selectedLocation?.slug ?? "",
          getShoppingLocationSlugServerSnapshot: () => selectedLocation?.slug ?? "",
          subscribeToShoppingLocationChanges: () => () => {},
          setStoredShoppingLocationSlug: () => {},
        };
      }
      if (specifier.endsWith(".module.css")) {
        return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      }
      return undefined;
    },
  });
}

function getPrimaryLinks(html) {
  const navigation = html.match(/<nav[^>]*aria-label="Primary navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(navigation);
  return [...navigation.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
    .map((match) => [match[1], match[2]]);
}

test("primary navigation always starts menu selection, including with a selected shop", () => {
  for (const pathname of ["/menu", "/menu/coronado/embed"]) {
    const load = createPageLoader(pathname, { slug: "coronado", name: "Coronado" });
    const Header = load("src/components/SiteHeader.tsx").default;
    const html = renderToStaticMarkup(createElement(Header));
    assert.deepEqual(getPrimaryLinks(html), [
      ["/menu", "Menu"],
      ["/locations", "Locations"],
      ["/order-online", "Order Online"],
      ["/catering", "Catering"],
    ]);
    assert.match(html, /<a(?=[^>]*href="\/menu")(?=[^>]*aria-current="page")[^>]*>/);
  }
});

test("homepage keeps primary and hero menu actions while dishes have no duplicate menu links", () => {
  const load = createPageLoader("/");
  const HomePage = load("src/app/page.tsx").default;
  const html = renderToStaticMarkup(createElement(HomePage));
  const primaryMenuLinks = getPrimaryLinks(html).filter(([href]) => href === "/menu");
  const hero = html.match(/<div[^>]*class="home-hero-actions"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(hero);
  const heroMenuLinks = [...hero.matchAll(/<a\b[^>]*href="\/menu(?:\/[^\"]*)?"/g)];
  assert.equal(primaryMenuLinks.length + heroMenuLinks.length, 2);
  const dishCaptions = [...html.matchAll(/<figcaption\b[^>]*class="home-dish-caption"[^>]*>([\s\S]*?)<\/figcaption>/g)];
  assert.ok(dishCaptions.length > 0);
  for (const [, caption] of dishCaptions) assert.doesNotMatch(caption, /href="\/menu/);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main);
  assert.equal([...main.matchAll(/<a\b[^>]*href="\/menu(?:\/[^\"]*)?"/g)].length, 1);
  assert.doesNotMatch(html, /View menu for/);
  assert.match(html, /aria-label="Mobile quick actions"/);
  assert.match(html, /id="delivery"/);
});

function getQuickActions(html) {
  const navigation = html.match(/<nav[^>]*aria-label="Mobile quick actions"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(navigation);
  return [...navigation.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map(([, type, attributes, content]) => ({
    type,
    label: content.match(/<span>([^<]+)<\/span>/)?.[1],
    href: attributes.match(/href="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&"),
    attributes,
  }));
}

test("restored mobile bar has Call, Directions, Menu, and Delivery with initial dialog controls", () => {
  const load = createPageLoader("/");
  const Header = load("src/components/SiteHeader.tsx").default;
  const html = renderToStaticMarkup(createElement(Header));
  const actions = getQuickActions(html);
  assert.deepEqual(actions.map(({ type, label, href }) => [type, label, href]), [
    ["a", "Call", "/#locations"],
    ["a", "Directions", "/#locations"],
    ["a", "Menu", "/menu"],
    ["button", "Delivery", undefined],
  ]);
  assert.match(actions[3].attributes, /aria-haspopup="dialog"/);
  assert.match(actions[3].attributes, /aria-controls="mobile-site-menu"/);
  assert.match(actions[3].attributes, /aria-expanded="false"/);
  assert.match(html, /class="site-drawer-layer[^\"]*" inert="" aria-hidden="true"/);
  assert.match(html, /data-home-logo-target/);
  assert.match(html, /<span class="hidden sm:inline-flex xl:hidden"><a class="brand-btn px-5 py-3 text-xs"/);
  assert.doesNotMatch(html, /class="site-drawer-layer[^\"]*is-open/);
});

test("mobile phone and directions follow the selected shop while Menu still opens location selection", () => {
  const data = createPageLoader("/menu")("src/data/locations.ts");
  for (const location of data.locations) {
    const load = createPageLoader("/menu", location);
    const Header = load("src/components/SiteHeader.tsx").default;
    const html = renderToStaticMarkup(createElement(Header));
    const actions = getQuickActions(html);
    assert.equal(actions[0].href, `tel:${location.phone}`);
    const directions = new URL(actions[1].href);
    assert.equal(directions.searchParams.get("destination"), location.address);
    assert.equal(directions.searchParams.get("destination_place_id"), location.placeId);
    assert.equal(actions[2].href, "/menu");
  }
});

test("order page keeps all four navigation destinations and catering offers configured phones", () => {
  const load = createPageLoader("/order-online");
  const OrderPage = load("src/app/order-online/page.tsx").default;
  const orderHtml = renderToStaticMarkup(createElement(OrderPage));
  assert.deepEqual(getPrimaryLinks(orderHtml).map(([href]) => href), ["/menu", "/locations", "/order-online", "/catering"]);

  const CateringPage = load("src/app/catering/page.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const cateringHtml = renderToStaticMarkup(createElement(CateringPage));
  for (const location of locations) assert.ok(cateringHtml.includes(`href="tel:${location.phone}"`));
});
