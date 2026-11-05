import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { createSourceLoader } from "./helpers.mjs";

const imagePath = "/images/og/prime-taco-shop.jpg";
const load = createSourceLoader({
  require: (specifier) => {
    if (specifier === "next/font/google") return { DM_Sans: ({ variable }) => ({ variable }) };
    if (specifier.startsWith("@/components/") || specifier === "next/script") return { __esModule: true, default: () => null };
    if (specifier.endsWith(".css")) return {};
    return undefined;
  },
});
const { site } = load("src/data/site-content.ts");
const { metadata: globalMetadata } = load("src/app/layout.tsx");
const { metadata: homeMetadata } = load("src/app/page.tsx");

function checkSocialImages(metadata) {
  const expectedUrl = new URL(imagePath, site.url).href;
  assert.equal(metadata.openGraph.images.length, 1);
  assert.equal(metadata.twitter.images.length, 1);
  const [openGraphImage] = metadata.openGraph.images;
  const [twitterImage] = metadata.twitter.images;
  assert.equal(new URL(openGraphImage.url, globalMetadata.metadataBase).href, expectedUrl);
  assert.equal(openGraphImage.width, 1200);
  assert.equal(openGraphImage.height, 630);
  assert.match(openGraphImage.alt, /Prime Taco Shop/);
  assert.ok(openGraphImage.alt.length > 20);
  assert.equal(metadata.twitter.card, "summary_large_image");
  assert.equal(new URL(twitterImage.url, globalMetadata.metadataBase).href, expectedUrl);
  assert.equal(twitterImage.width, openGraphImage.width);
  assert.equal(twitterImage.height, openGraphImage.height);
  assert.equal(twitterImage.alt, openGraphImage.alt);
}

test("global sharing metadata uses the landscape image on the Prime Taco Shop domain", () => {
  assert.equal(site.url, "https://primetacoshop.com");
  assert.equal(globalMetadata.metadataBase.href, new URL(site.url).href);
  assert.equal(globalMetadata.alternates.canonical, site.url);
  assert.equal(globalMetadata.openGraph.url, site.url);
  checkSocialImages(globalMetadata);
});

test("homepage Open Graph and Twitter overrides use the same landscape image", () => {
  assert.equal(homeMetadata.alternates.canonical, site.url);
  assert.equal(homeMetadata.openGraph.url, site.url);
  checkSocialImages(homeMetadata);
});

for (const route of ["careers", "order-online", "faq", "locations", "our-story"]) {
  test(`${route} sharing metadata uses the landscape image and retains its own page details`, () => {
    const { metadata } = load(`src/app/${route}/page.tsx`);
    assert.equal(new URL(metadata.alternates.canonical, site.url).href, `${site.url}/${route}`);
    assert.equal(new URL(metadata.openGraph.url, site.url).href, `${site.url}/${route}`);
    assert.equal(metadata.openGraph.title, metadata.title);
    assert.equal(metadata.twitter.title, metadata.title);
    assert.equal(metadata.openGraph.description, metadata.description);
    assert.equal(metadata.twitter.description, metadata.description);
    checkSocialImages(metadata);
  });
}

test("each location's generated sharing metadata uses the landscape image and preserves its canonical URL", async () => {
  const { locations } = load("src/data/locations.ts");
  const { generateMetadata } = load("src/app/locations/[slug]/page.tsx");
  for (const location of locations) {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: location.slug }) });
    const locationUrl = `${site.url}/locations/${location.slug}`;
    assert.equal(metadata.alternates.canonical, locationUrl);
    assert.equal(metadata.openGraph.url, locationUrl);
    assert.equal(metadata.title, location.name);
    assert.equal(metadata.openGraph.title, `${location.name} | Prime Tacos`);
    assert.equal(metadata.twitter.title, metadata.openGraph.title);
    assert.equal(metadata.openGraph.description, `${location.address}. ${location.hours}.`);
    assert.equal(metadata.twitter.description, metadata.openGraph.description);
    checkSocialImages(metadata);
  }
});

test("the public sharing asset matches its declared JPEG format and dimensions", async () => {
  const metadata = await sharp(fileURLToPath(new URL(`../public${imagePath}`, import.meta.url))).metadata();
  assert.equal(metadata.format, "jpeg");
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
});
