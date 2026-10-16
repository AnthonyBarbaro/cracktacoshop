import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import * as React from "react";

import { createSourceLoader, loadSourceModule } from "./helpers.mjs";

const { foodShowcase, site } = loadSourceModule("src/data/site-content.ts");

function makeInstagramHarness({ server = false } = {}) {
  const storage = new Map();
  const browserWindow = new EventTarget();
  browserWindow.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  let effects = [];
  const load = createSourceLoader({
    ...(server ? {} : { window: browserWindow }),
    require: (specifier) => {
      if (specifier === "react") {
        return {
          ...React,
          useEffect: (callback) => { effects.push(callback); },
          useSyncExternalStore: (_subscribe, snapshot, serverSnapshot) => server ? serverSnapshot() : snapshot(),
        };
      }
      if (specifier === "next/script") return function ScriptMock(props) { return React.createElement("script", props); };
      if (specifier === "next/image") return function ImageMock(props) { return React.createElement("img", props); };
      if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => key }) };
      return undefined;
    },
  });
  const { default: InstagramSection } = load("src/components/InstagramSection.tsx");
  const preferences = load("src/lib/cookie-preferences.ts");

  const expand = (node) => {
    if (Array.isArray(node)) return node.map(expand);
    if (!React.isValidElement(node)) return node;
    if (typeof node.type === "function") return expand(node.type(node.props));
    return { type: node.type, props: { ...node.props, children: expand(node.props.children) } };
  };

  const render = () => {
    effects = [];
    const tree = expand(InstagramSection());
    for (const effect of effects) effect();
    return tree;
  };

  return { window: browserWindow, preferences, render };
}

function findElements(node, type) {
  if (Array.isArray(node)) return node.flatMap((child) => findElements(child, type));
  if (!node || typeof node !== "object") return [];
  return [
    ...(node.type === type ? [node] : []),
    ...findElements(node.props?.children, type),
  ];
}

test("Instagram loads no external embed before consent and always offers the stored profile link", () => {
  const harness = makeInstagramHarness();
  let settingsOpened = 0;
  harness.window.addEventListener("cts-cookie-settings-open", () => { settingsOpened++; });

  for (const preference of ["unset", "disabled"]) {
    if (preference !== "unset") harness.preferences.setCookiePreference(preference);
    const tree = harness.render();
    assert.equal(findElements(tree, "script").length, 0);
    assert.equal(findElements(tree, "blockquote").length, 0);
    const photos = findElements(tree, "img");
    assert.equal(photos.length, 4);
    for (const photo of photos) {
      assert.ok(photo.props.src.startsWith("/images/"));
      assert.ok(fs.existsSync(new URL(`../public${photo.props.src}`, import.meta.url)));
      assert.equal(photo.props.alt, foodShowcase.find((entry) => entry.src === photo.props.src)?.alt);
    }
    assert.ok(findElements(tree, "a").every((link) => link.props.href === site.instagram));
    const [profile] = findElements(tree, "a");
    assert.equal(profile.props.href, site.instagram);
    assert.equal(profile.props.target, "_blank");
    assert.equal(profile.props.rel, "noopener noreferrer");
    const [settings] = findElements(tree, "button");
    settings.props.onClick();
  }
  assert.equal(settingsOpened, 2);
});

test("the server snapshot keeps Instagram embeds unloaded", () => {
  const tree = makeInstagramHarness({ server: true }).render();
  assert.equal(findElements(tree, "script").length, 0);
  assert.equal(findElements(tree, "blockquote").length, 0);
  assert.equal(findElements(tree, "img").length, 4);
  assert.equal(findElements(tree, "a")[0].props.href, site.instagram);
});

test("enabled consent loads the profile embed and processes it when the script becomes ready", () => {
  const harness = makeInstagramHarness();
  harness.preferences.setCookiePreference("enabled");
  const tree = harness.render();
  const [script] = findElements(tree, "script");
  const [blockquote] = findElements(tree, "blockquote");
  assert.equal(script.props.src, "https://www.instagram.com/embed.js");
  assert.equal(script.props.strategy, "afterInteractive");
  assert.equal(blockquote.props["data-instgrm-permalink"], site.instagram);
  assert.equal(blockquote.props["data-instgrm-version"], "14");
  assert.equal(findElements(tree, "img").length, 0);
  assert.ok(findElements(tree, "a").every((link) => link.props.href === site.instagram));

  let processes = 0;
  harness.window.instgrm = { Embeds: { process: () => { processes++; } } };
  script.props.onLoad();
  assert.equal(processes, 1);
  script.props.onReady();
  assert.equal(processes, 2);
});

test("revoking consent removes the embed and prevents a late script callback from processing it", () => {
  const harness = makeInstagramHarness();
  let processes = 0;
  harness.window.instgrm = { Embeds: { process: () => { processes++; } } };
  harness.preferences.setCookiePreference("enabled");
  const [script] = findElements(harness.render(), "script");
  assert.equal(processes, 1);

  harness.preferences.setCookiePreference("disabled");
  const disabledTree = harness.render();
  assert.equal(findElements(disabledTree, "script").length, 0);
  assert.equal(findElements(disabledTree, "blockquote").length, 0);
  assert.equal(findElements(disabledTree, "img").length, 4);
  script.props.onLoad();
  script.props.onReady();
  assert.equal(processes, 1);

  harness.preferences.setCookiePreference("enabled");
  const enabledTree = harness.render();
  assert.equal(findElements(enabledTree, "blockquote").length, 1);
  assert.equal(processes, 2);
});
