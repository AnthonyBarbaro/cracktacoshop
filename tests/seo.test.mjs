import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { createSourceLoader } from "./helpers.mjs";

const load = createSourceLoader({
  require: (specifier) => {
    if (specifier.startsWith("@/components/")) return { __esModule: true, default: () => null };
    if (specifier === "next/navigation") return { notFound: () => { throw new Error("404"); } };
    return undefined;
  },
});
const { locations } = load("src/data/locations.ts");
const { getLocationRestaurantSchema } = load("src/lib/location-schema.ts");

test("sitemap contains only canonical public pages without invented modification dates", () => {
  const entries = load("src/app/sitemap.ts").default();
  assert.equal(entries.length, 11);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.equal(url.origin, "https://primetacoshop.com");
    assert.equal(url.search, "");
    assert.equal(entry.lastModified, undefined);
    assert.doesNotMatch(url.pathname, /^\/(menu|contact|reviews)(\/|$)/);
  }
  for (const location of locations) {
    assert.ok(entries.some((entry) => entry.url.endsWith(`/locations/${location.slug}`)));
  }
});

test("schema withholds unresolved addresses, hours and phone numbers", () => {
  assert.equal(getLocationRestaurantSchema(locations.find((location) => location.slug === "encinitas")), undefined);
  const seaport = getLocationRestaurantSchema(locations.find((location) => location.slug === "seaport-village"));
  assert.equal(seaport.address.streetAddress, "817 W. Harbor Dr., Suite D");
  assert.equal(seaport.openingHoursSpecification, undefined);
  const mission = getLocationRestaurantSchema(locations.find((location) => location.slug === "mission-valley"));
  assert.equal(mission.telephone, undefined);
  const coronado = getLocationRestaurantSchema(locations.find((location) => location.slug === "coronado"));
  assert.equal(coronado.openingHoursSpecification.opens, "08:00");
  assert.equal(coronado.openingHoursSpecification.closes, "02:00");
});

test("location HTML contains useful menu text and only its own resolved Restaurant entity before JavaScript", async () => {
  const Page = load("src/app/locations/[slug]/page.tsx").default;
  for (const location of locations) {
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ slug: location.slug }) }));
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(html.includes(location.name));
    assert.ok(html.includes(location.toastUrl));
    assert.ok(html.includes(`href="tel:${location.phone}"`));
    assert.ok(html.includes('href="#menu"'));
    for (const highlight of location.menuHighlights) assert.ok(html.includes(highlight));
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)]
      .map(([, json]) => JSON.parse(json));
    if (location.slug === "encinitas") {
      assert.equal(schemas.length, 0);
      assert.doesNotMatch(html, /(?:106|110) Leucadia/);
    } else {
      assert.equal(schemas.length, 1);
      const [schema] = schemas;
      assert.equal(schema["@type"], "Restaurant");
      assert.equal(schema["@id"], `https://primetacoshop.com/locations/${location.slug}#restaurant`);
      assert.equal(schema.name, `Prime Taco Shop ${location.name}`);
      assert.equal(schema.hasMenu, location.toastUrl);
      assert.equal(schema.aggregateRating, undefined);
      assert.equal(schema.geo, undefined);
      assert.equal(schema.priceRange, undefined);
      assert.deepEqual(schema.sameAs, ["https://www.instagram.com/primetacoshop/"]);
    }
  }
});

test("unrecognized location pages and metadata use the framework's 404", async () => {
  const { default: Page, generateMetadata } = load("src/app/locations/[slug]/page.tsx");
  for (const handler of [Page, generateMetadata]) {
    await assert.rejects(handler({ params: Promise.resolve({ slug: "missing-shop" }) }), /404/);
  }
});
