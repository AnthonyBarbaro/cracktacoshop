import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";

import { createSourceLoader, loadSourceModule } from "./helpers.mjs";

const { locations } = loadSourceModule("src/data/locations.ts");

function createOrderingView(initialSlug) {
  let selectedSlug = initialSlug;
  let nextId = 0;
  const selectedSlugs = [];
  const load = createSourceLoader({
    require: (specifier) => {
      if (specifier === "react") {
        return {
          ...React,
          useId: () => `order-test-${nextId++}`,
          useRef: (current) => ({ current }),
        };
      }
      if (specifier === "@/lib/use-shopping-location") {
        return { useShoppingLocation: () => locations.find((location) => location.slug === selectedSlug) };
      }
      if (specifier === "@/lib/shopping-location") {
        return { setStoredShoppingLocationSlug: (slug) => {
          selectedSlugs.push(slug);
          selectedSlug = slug;
        } };
      }
      if (specifier.endsWith(".module.css")) return { heading: "heading", locationPicker: "locationPicker" };
      return undefined;
    },
  });

  return {
    render: load("src/components/OrderOnlineSection.tsx").default,
    renderPage: load("src/components/OrderOnlineContent.tsx").default,
    selectedSlugs,
  };
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !node.props) return [];
  return [node, ...elements(node.props.children)];
}

function findElement(node, type) {
  return elements(node).find((element) => element.type === type);
}

test("shared ordering section gives each heading and location selector unique accessible IDs", () => {
  const view = createOrderingView();
  const home = view.render({ id: "delivery", reveal: true });
  const page = view.renderPage();
  const order = view.render(findElement(page, view.render).props);
  const homeHeading = findElement(home, "h2");
  const orderHeading = findElement(order, "h1");

  assert.equal(home.props.id, "delivery");
  assert.equal(findElement(page, "main").props.id, "main-content");
  assert.equal(home.props["aria-labelledby"], homeHeading.props.id);
  assert.equal(order.props["aria-labelledby"], orderHeading.props.id);
  assert.notEqual(homeHeading.props.id, orderHeading.props.id);
  assert.equal(findElement(home, "label").props.htmlFor, findElement(home, "select").props.id);
  assert.equal(findElement(order, "label").props.htmlFor, findElement(order, "select").props.id);
  assert.notEqual(findElement(home, "select").props.id, findElement(order, "select").props.id);
  assert.equal(elements(home).find((element) => element.props["data-reveal"]).props["data-reveal"], true);
  assert.equal(elements(order).some((element) => element.props["data-reveal"]), false);
});

test("pickup works for a first visit by directing guests to the inline location selector", () => {
  const view = createOrderingView();
  const initial = view.render({ headingLevel: 1 });
  const select = findElement(initial, "select");
  let focused = false;
  select.props.ref.current = { focus: () => { focused = true; } };

  assert.equal(select.props.value, "");
  assert.deepEqual(elements(select).filter((element) => element.type === "option").map((option) => option.props.value), ["", ...locations.map((location) => location.slug)]);
  assert.equal(elements(initial).some((element) => element.props.href === "/order-online"), false);
  findElement(initial, "button").props.onClick();
  assert.equal(focused, true);

  select.props.onChange({ target: { value: "coronado" } });
  const selected = view.render({ headingLevel: 1 });
  assert.deepEqual(view.selectedSlugs, ["coronado"]);
  assert.equal(findElement(selected, "select").props.value, "coronado");
  assert.equal(findElement(selected, "a").props.href, locations.find((location) => location.slug === "coronado").toastUrl);

  select.props.onChange({ target: { value: "unknown-shop" } });
  assert.deepEqual(view.selectedSlugs, ["coronado"]);
});

test("every location keeps its exact pickup URL and its delivery drawer selection", () => {
  for (const location of locations) {
    const view = createOrderingView(location.slug);
    const section = view.render({});
    const pickup = findElement(section, "a");
    const delivery = elements(section).find((element) => element.props.locationSlug === location.slug);
    assert.equal(pickup.props.href, location.toastUrl);
    assert.equal(pickup.props.target, "_blank");
    assert.equal(pickup.props.rel, "noopener noreferrer");
    assert.equal(delivery.type.name, "DeliveryButton");

    const select = findElement(section, "select");
    const otherLocation = locations.find((shop) => shop.slug !== location.slug);
    select.props.onChange({ target: { value: otherLocation.slug } });
    assert.equal(findElement(view.render({}), "a").props.href, otherLocation.toastUrl);
  }
});
