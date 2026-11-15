import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";

import { createSourceLoader } from "./helpers.mjs";

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement(node)) return [];
  return [node, ...elements(node.props.children)];
}

function makeHeader(pathname = "/", initialSlug = "") {
  const hooks = [];
  let cursor = 0;
  let selectedSlug = initialSlug;
  const load = createSourceLoader({
    require: (specifier) => {
      if (specifier === "react") return {
        ...React,
        useState: (initial) => {
          const index = cursor++;
          if (!(index in hooks)) hooks[index] = initial;
          return [hooks[index], (value) => { hooks[index] = value; }];
        },
        useRef: (current) => hooks[cursor++] ??= { current },
        useMemo: (factory) => factory(),
        useEffect: () => {},
        useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
      };
      if (specifier === "next/navigation") return { usePathname: () => pathname, useRouter: () => ({ push() {} }) };
      if (specifier === "@/lib/shopping-location") return {
        subscribeToShoppingLocationChanges: () => () => {},
        getShoppingLocationSlugSnapshot: () => selectedSlug,
        getShoppingLocationSlugServerSnapshot: () => selectedSlug,
        setStoredShoppingLocationSlug: (slug) => { selectedSlug = slug; },
      };
      if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) };
      return undefined;
    },
  });
  const Header = load("src/components/SiteHeader.tsx").default;
  const render = (props = {}) => { cursor = 0; return Header(props); };
  return {
    render,
    locations: load("src/data/locations.ts").locations,
    selectedSlug: () => selectedSlug,
    find: (predicate) => elements(render()).find(predicate),
    open: () => elements(render()).find((element) => element.props.className === "orderButton").props.onClick(),
  };
}

test("Order Online opens a dialog offering pickup and delivery, then closes with the close button or backdrop", () => {
  const header = makeHeader("/", "seaport-village");
  header.open();
  const dialog = header.find((element) => element.props.role === "dialog");
  assert.equal(dialog.props["aria-modal"], "true");
  assert.equal(dialog.props["aria-describedby"], "order-description");
  assert.equal(header.find((element) => element.props.id === "mobile-menu-title").props.children, "Pickup or delivery?");
  const choices = header.find((element) => element.props.className === "order-dialog-choices");
  assert.equal(elements(choices).filter((element) => element.type === "a" || element.type === "button").length, 2);
  for (const label of ["Close ordering options", "Close ordering options overlay"]) {
    header.find((element) => element.props["aria-label"] === label).props.onClick();
    assert.equal(header.find((element) => element.props.className === "orderButton").props["aria-expanded"], false);
    header.open();
  }
});

test("pickup and delivery use the chosen shop, including when switching shops from a location page", () => {
  const header = makeHeader("/locations/seaport-village");
  header.open();
  assert.equal(header.find((element) => element.props.id === "order-location").props.value, "seaport-village");
  for (const location of header.locations) {
    header.find((element) => element.props.id === "order-location").props.onChange({ target: { value: location.slug } });
    assert.equal(header.selectedSlug(), location.slug);
    const choices = header.find((element) => element.props.className === "order-dialog-choices");
    const pickup = elements(choices).find((element) => element.type === "a");
    assert.equal(pickup.props.href, location.toastUrl);
    assert.equal(pickup.props["aria-label"], `Order pickup from ${location.name}`);
    elements(choices).find((element) => element.type === "button").props.onClick();
    assert.equal(header.find((element) => element.props.id === "delivery-location").props.value, location.slug);
    const services = header.find((element) => element.type?.name === "DeliveryLinks");
    assert.equal(services.props.location.slug, location.slug);
    header.open();
  }
});

test("without a selected shop pickup asks for a location and delivery keeps its location chooser", () => {
  const header = makeHeader();
  header.open();
  const select = header.find((element) => element.props.id === "order-location");
  assert.equal(select.props.value, "");
  let focused = false;
  select.props.ref.current = { focus: () => { focused = true; } };
  const choices = header.find((element) => element.props.className === "order-dialog-choices");
  assert.equal(elements(choices).some((element) => element.type === "a"), false);
  const buttons = elements(choices).filter((element) => element.type === "button");
  buttons[0].props.onClick();
  assert.equal(focused, true);
  assert.equal(header.selectedSlug(), "");
  buttons[1].props.onClick();
  assert.equal(header.find((element) => element.props.id === "delivery-location").props.value, "");
});

test("the mobile menu opens the same ordering dialog and custom CTA destinations remain links", () => {
  const header = makeHeader();
  header.find((element) => element.props.className === "brand-btn drawer-order").props.onClick();
  assert.equal(header.find((element) => element.props.id === "mobile-menu-title").props.children, "Pickup or delivery?");
  const custom = elements(header.render({ ctaHref: "/catering", ctaLabel: "Catering" }))
    .find((element) => element.props.className === "orderButton");
  assert.equal(custom.props.href, "/catering");
  assert.equal(custom.props.children, "Catering");
});
