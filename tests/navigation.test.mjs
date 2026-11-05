import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader } from "./helpers.mjs";

function createPageLoader(pathname, selectedLocation, globals = {}) {
  const { setStoredShoppingLocationSlug = () => {}, captureLinkProps, ...runtimeGlobals } = globals;
  return createSourceLoader({
    ...runtimeGlobals,
    require: (specifier) => {
      if (specifier === "next/link" && captureLinkProps) return function CapturedLink({ href, prefetch, children, ...props }) {
        captureLinkProps({ href, prefetch });
        return createElement("a", { ...props, href }, children);
      };
      if (specifier === "next/navigation") return { usePathname: () => pathname, useRouter: () => ({ push: () => {} }) };
      if (specifier === "@/lib/use-shopping-location") return { useShoppingLocation: () => selectedLocation };
      if (specifier === "@/lib/shopping-location") {
        return {
          getShoppingLocationSlugSnapshot: () => selectedLocation?.slug ?? "",
          getShoppingLocationSlugServerSnapshot: () => selectedLocation?.slug ?? "",
          subscribeToShoppingLocationChanges: () => () => {},
          setStoredShoppingLocationSlug,
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

test("primary navigation opens Toast for the selected shop or Mission Valley by default", () => {
  const { locations } = createPageLoader("/")("src/data/locations.ts");
  for (const location of [undefined, ...locations]) {
    const load = createPageLoader("/", location);
    const Header = load("src/components/SiteHeader.tsx").default;
    const html = renderToStaticMarkup(createElement(Header));
    assert.deepEqual(getPrimaryLinks(html), [
      [location?.toastUrl ?? locations[0].toastUrl, "Menu"],
      ["/locations", "Locations"],
      ["/catering", "Catering"],
    ]);
    assert.doesNotMatch(html, /href="\/menu/);
  }
});

test("header and footer links keep their destinations without automatically prefetching route assets", () => {
  const { locations } = createPageLoader("/")("src/data/locations.ts");
  const selectedLocation = locations[2];
  const captured = [];
  const load = createPageLoader("/", selectedLocation, { captureLinkProps: (props) => captured.push(props) });
  const Header = load("src/components/SiteHeader.tsx").default;
  const Footer = load("src/components/SiteFooter.tsx").default;

  renderToStaticMarkup(createElement(Header));
  assert.deepEqual(captured.map(({ href }) => href), [
    "/", selectedLocation.toastUrl, "/locations", "/catering", "/order-online",
    selectedLocation.toastUrl, "/locations", "/catering", "/order-online",
  ]);
  for (const { prefetch } of captured) assert.equal(prefetch, false);

  const commonFooterHrefs = ["/locations", "/catering", "/our-story", "/careers", "/faq", "/order-online"];
  for (const variant of ["minimal", "default"]) {
    captured.length = 0;
    renderToStaticMarkup(createElement(Footer, { variant }));
    const expected = variant === "minimal" ? commonFooterHrefs : [
      ...commonFooterHrefs,
      ...locations.flatMap((location) => [`/locations/${location.slug}`, location.toastUrl]),
    ];
    assert.deepEqual(captured.map(({ href }) => href), expected);
    for (const { prefetch } of captured) assert.equal(prefetch, false);
  }
});

test("header and menu drawer each offer one ordering action beside three navigation links", () => {
  const Header = createPageLoader("/")("src/components/SiteHeader.tsx").default;
  const html = renderToStaticMarkup(createElement(Header));
  const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
  const drawer = html.match(/<aside\b[^>]*id="mobile-site-menu"[^>]*>([\s\S]*?)<\/aside>/)?.[1];
  assert.ok(header);
  assert.ok(drawer);
  assert.equal(getPrimaryLinks(header).length, 3);
  assert.equal([...header.matchAll(/<a\b[^>]*href="\/order-online"/g)].length, 1);
  assert.match(header, /<a\b[^>]*href="\/order-online"[^>]*>Order Online<\/a>/);
  assert.match(header, /<button\b[^>]*aria-label="Open menu"[^>]*aria-controls="mobile-site-menu"/);
  assert.match(header, /<button\b[^>]*aria-label="Accessibility options"/);
  assert.match(header, /<button\b[^>]*aria-label="Choose a store"[^>]*aria-haspopup="dialog"/);
  assert.doesNotMatch(header, /Find your Prime|header-location-pin/);
  assert.equal([...drawer.matchAll(/<a\b[^>]*href="\/order-online"/g)].length, 1);
  const drawerNavigation = drawer.match(/<nav[^>]*aria-label="Site sections"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(drawerNavigation);
  assert.equal([...drawerNavigation.matchAll(/<a\b/g)].length, 3);
  assert.doesNotMatch(drawerNavigation, /href="\/order-online"/);
});

test("homepage opens with food, the logo intro, and one ordering action while keeping all photos in the rail", () => {
  const load = createPageLoader("/");
  const HomePage = load("src/app/page.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const { heroFoodPhotos } = load("src/data/food-photos.ts");
  const html = renderToStaticMarkup(createElement(HomePage));
  const primaryMenuLinks = getPrimaryLinks(html).filter(([href]) => href === locations[0].toastUrl);
  const hero = html.match(/<section[^>]*data-home-hero="true"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(hero);
  assert.match(hero, /class="home-hero-logo"/);
  assert.equal(heroFoodPhotos.length, 4);
  assert.equal([...hero.matchAll(/<img\b/g)].length, heroFoodPhotos.length + 1);
  assert.doesNotMatch(hero, /<select\b/);
  assert.match(hero, /href="\/order-online"/);
  assert.equal([...hero.matchAll(/<a\b/g)].length, 1);
  assert.equal(primaryMenuLinks.length, 1);
  assert.match(hero, /Home of the<br\/>Tri-Tip Taco/);
  const heroImageUrls = [...hero.matchAll(/<img\b[^>]*src="([^"]+)"/g)]
    .map(([, src]) => new URL(src.replaceAll("&amp;", "&"), "https://example.test"));
  assert.ok(heroImageUrls.some((url) => url.pathname === heroFoodPhotos[0].src || url.searchParams.get("url") === heroFoodPhotos[0].src));
  const gallery = html.match(/<section[^>]*aria-label="Prime Tacos food gallery"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(gallery);
  assert.equal([...gallery.matchAll(/<img\b/g)].length, 27);
  assert.deepEqual([...gallery.matchAll(/data-photo-group="([^"]+)"/g)].map(([, group]) => group), ["before", "original", "after"]);
  const originalPhotos = gallery.split('data-photo-group="original"')[1]?.split('data-photo-group="after"')[0];
  assert.ok(originalPhotos);
  assert.equal([...originalPhotos.matchAll(/<img\b/g)].length, 9);
  assert.equal([...gallery.matchAll(/<img\b[^>]*alt="[^"]+"/g)].length, 9);
  assert.doesNotMatch(gallery, /<(?:h[1-6]|p|figcaption|a)\b/);
  assert.doesNotMatch(originalPhotos, /alt=""/);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main);
  for (const location of locations) assert.ok(main.includes(`href="${location.toastUrl}"`));
  assert.doesNotMatch(html, /View menu for/);
  assert.match(html, /aria-label="Mobile quick actions"/);
  assert.match(html, /id="catering"/);
});

test("homepage replaces the repeated ordering selector with a food-led catering invitation", () => {
  const HomeContent = createPageLoader("/")("src/components/HomeContent.tsx").default;
  const html = renderToStaticMarkup(createElement(HomeContent));
  const catering = html.match(/<section[^>]*id="catering"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(catering);
  assert.match(catering, /Tacos for the<br\/>whole crew\./);
  assert.match(catering, /takeout-spread\.webp/);
  assert.match(catering, /href="\/catering"/);
  assert.equal([...catering.matchAll(/<a\b/g)].length, 1);
  assert.doesNotMatch(html, /<select\b|At our place\.|Your location|id="delivery"/);
});

test("each homepage shop button selects that shop through the shared store setter", () => {
  const selectedSlugs = [];
  const load = createPageLoader("/", undefined, { setStoredShoppingLocationSlug: (slug) => selectedSlugs.push(slug) });
  const HomeContent = load("src/components/HomeContent.tsx").default;
  const { locations } = load("src/data/locations.ts");
  let tree;
  function CaptureHome() {
    tree = HomeContent();
    return tree;
  }
  renderToStaticMarkup(createElement(CaptureHome));
  const stores = tree.props.children.find((child) => isValidElement(child) && child.props.id === "locations");
  assert.ok(stores);
  const grid = stores.props.children.find((child) => isValidElement(child) && child.props.className === "home-shop-grid");
  assert.ok(grid);
  assert.equal(grid.props.children.length, locations.length);
  grid.props.children.forEach((card, index) => {
    const heading = card.props.children.find((child) => isValidElement(child) && child.type === "h3");
    assert.ok(heading);
    const button = heading.props.children;
    assert.equal(button.type, "button");
    assert.equal(button.props.type, "button");
    assert.equal(button.props["aria-pressed"], false);
    assert.equal(button.props["aria-label"], `Select ${locations[index].name} as your store`);
    button.props.onClick();
  });
  assert.deepEqual(selectedSlugs, [...locations].map((location) => location.slug));
});

test("homepage shop cards identify only the current store and invite selecting the others", () => {
  const { locations } = createPageLoader("/")("src/data/locations.ts");
  for (const selectedLocation of [undefined, ...locations]) {
    const HomeContent = createPageLoader("/", selectedLocation)("src/components/HomeContent.tsx").default;
    const html = renderToStaticMarkup(createElement(HomeContent));
    const cards = [...html.matchAll(/<article\b[^>]*class="home-shop"[^>]*>[\s\S]*?<\/article>/g)].map(([card]) => card);
    assert.equal(cards.length, locations.length);
    cards.forEach((card, index) => {
      const location = locations[index];
      const isSelected = location.slug === selectedLocation?.slug;
      assert.ok(card.includes(`data-selected="${isSelected}"`));
      assert.ok(card.includes(`aria-pressed="${isSelected}"`));
      assert.ok(card.includes(`aria-label="${isSelected ? `Selected store: ${location.name}` : `Select ${location.name} as your store`}"`));
      assert.ok(card.includes(isSelected ? 'class="home-selected-store">Your store</span>' : 'class="home-select-store">Select store</span>'));
      assert.doesNotMatch(card, /<h3><a\b/);
      assert.ok(card.includes(`href="${location.toastUrl}"`));
      assert.ok(card.includes(`aria-label="Directions to ${location.name}"`));
    });
    assert.equal([...html.matchAll(/class="home-selected-store"/g)].length, selectedLocation ? 1 : 0);
  }
});

test("the hero ordering action opens the selected shop's Toast page", () => {
  const { locations } = createPageLoader("/")("src/data/locations.ts");
  for (const location of locations) {
    const HomePage = createPageLoader("/", location)("src/app/page.tsx").default;
    const html = renderToStaticMarkup(createElement(HomePage));
    const hero = html.match(/<section[^>]*data-home-hero="true"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(hero);
    assert.ok(hero.includes(`href="${location.toastUrl}"`));
  }
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

test("mobile bar starts with accessibility and keeps pickup and delivery within reach", () => {
  const load = createPageLoader("/");
  const Header = load("src/components/SiteHeader.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const html = renderToStaticMarkup(createElement(Header));
  const actions = getQuickActions(html);
  assert.deepEqual(actions.map(({ type, label, href }) => [type, label, href]), [
    ["button", "Access", undefined],
    ["a", "Pickup", "/order-online"],
    ["a", "Map", "/#locations"],
    ["a", "Menu", locations[0].toastUrl],
    ["button", "Delivery", undefined],
  ]);
  assert.match(actions[0].attributes, /aria-label="Accessibility options"/);
  assert.match(actions[0].attributes, /aria-haspopup="dialog"/);
  assert.match(actions[0].attributes, /aria-controls="accessibility-widget-panel"/);
  assert.match(actions[2].attributes, /aria-label="Map and directions to our locations"/);
  assert.match(actions[4].attributes, /aria-haspopup="dialog"/);
  assert.match(actions[4].attributes, /aria-controls="mobile-site-menu"/);
  assert.match(actions[4].attributes, /aria-expanded="false"/);
  assert.match(html, /class="site-drawer-layer[^\"]*" inert="" aria-hidden="true"/);
  assert.match(html, /data-home-logo-target/);
  assert.doesNotMatch(html, /class="site-drawer-layer[^\"]*is-open/);
});

test("the mobile accessibility action opens the existing settings dialog", () => {
  const window = new EventTarget();
  const load = createPageLoader("/", undefined, { window });
  const Header = load("src/components/SiteHeader.tsx").default;
  const { ACCESSIBILITY_OPEN_EVENT } = load("src/lib/accessibility-preferences.ts");
  let opens = 0;
  window.addEventListener(ACCESSIBILITY_OPEN_EVENT, () => { opens++; });
  let tree;
  function CaptureHeader() {
    tree = Header({});
    return tree;
  }
  renderToStaticMarkup(createElement(CaptureHeader));
  const bar = tree.props.children.find((child) => isValidElement(child) && child.props["aria-label"] === "Mobile quick actions");
  assert.ok(bar);
  const accessButton = bar.props.children[0];
  assert.equal(accessButton.type, "button");
  assert.equal(accessButton.props["aria-controls"], "accessibility-widget-panel");
  accessButton.props.onClick();
  assert.equal(opens, 1);
});

test("mobile pickup, directions, and Toast menu follow the selected shop", () => {
  const data = createPageLoader("/menu")("src/data/locations.ts");
  for (const location of data.locations) {
    const load = createPageLoader("/menu", location);
    const Header = load("src/components/SiteHeader.tsx").default;
    const html = renderToStaticMarkup(createElement(Header));
    const actions = getQuickActions(html);
    assert.equal(actions[1].href, location.toastUrl);
    const directions = new URL(actions[2].href);
    assert.ok(actions[2].attributes.includes(`aria-label="Map and directions to ${location.name}"`));
    assert.equal(directions.searchParams.get("destination"), location.address);
    assert.equal(directions.searchParams.get("destination_place_id"), location.placeId);
    assert.equal(actions[3].href, location.toastUrl);
  }
});

test("order page keeps three navigation links and a separate ordering action while catering offers configured phones", () => {
  const load = createPageLoader("/order-online");
  const OrderPage = load("src/app/order-online/page.tsx").default;
  const { locations } = load("src/data/locations.ts");
  const orderHtml = renderToStaticMarkup(createElement(OrderPage));
  assert.deepEqual(getPrimaryLinks(orderHtml).map(([href]) => href), [locations[0].toastUrl, "/locations", "/catering"]);
  const header = orderHtml.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
  assert.ok(header);
  assert.equal([...header.matchAll(/<a\b[^>]*href="\/order-online"/g)].length, 1);

  const CateringPage = load("src/app/catering/page.tsx").default;
  const cateringHtml = renderToStaticMarkup(createElement(CateringPage));
  for (const location of locations) assert.ok(cateringHtml.includes(`href="tel:${location.phone}"`));
});
