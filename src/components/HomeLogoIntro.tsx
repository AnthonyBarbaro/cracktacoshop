"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, type ReactElement } from "react";

import { getReducedMotionSnapshot, subscribeToReducedMotion } from "@/lib/accessibility-preferences";

export default function HomeLogoIntro(): ReactElement {
  const logoRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const source = logoRef.current;
    const target = document.querySelector<HTMLImageElement>("[data-home-logo-target]");
    if (!source || !target) return;

    let frame: number | undefined;
    let timer: number | undefined;
    let phase: "waiting" | "flying" | "docked" = "waiting";
    let startedAt = 0;
    let disposed = false;
    let triggersAttached = true;
    let geometryAttached = true;
    let previousScrollY = Math.max(window.scrollY, 0);
    let unsubscribe = (): void => {};
    const initialVisibility = source.style.visibility;
    const visualViewport = window.visualViewport;
    const fonts = document.fonts;

    // Keep the hero's space intact so docking never shifts the page.
    const flyingLogo = source.cloneNode() as HTMLImageElement;
    flyingLogo.removeAttribute("class");
    flyingLogo.removeAttribute("srcset");
    flyingLogo.removeAttribute("sizes");
    // Load the visible logo's selected size only when the flight starts.
    flyingLogo.removeAttribute("src");
    flyingLogo.alt = "";
    flyingLogo.setAttribute("aria-hidden", "true");
    flyingLogo.setAttribute("data-home-logo-flight", "");
    Object.assign(flyingLogo.style, {
      position: "fixed",
      top: "0",
      left: "0",
      maxWidth: "none",
      margin: "0",
      display: "none",
      pointerEvents: "none",
      transformOrigin: "center",
      zIndex: "45",
    });
    document.body.append(flyingLogo);

    const stopTriggers = (): void => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
      if (!triggersAttached) return;
      triggersAttached = false;
      window.removeEventListener("scroll", onScroll);
    };

    const stopGeometry = (): void => {
      if (!geometryAttached) return;
      geometryAttached = false;
      window.removeEventListener("resize", requestUpdate);
      visualViewport?.removeEventListener("resize", requestUpdate);
      visualViewport?.removeEventListener("scroll", requestUpdate);
      source.removeEventListener("load", requestUpdate);
      target.removeEventListener("load", requestUpdate);
      fonts?.removeEventListener("loadingdone", requestUpdate);
      observer?.disconnect();
      unsubscribe();
    };

    const finish = (): void => {
      phase = "docked";
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      frame = undefined;
      stopTriggers();
      stopGeometry();
      source.style.visibility = "hidden";
      flyingLogo.style.display = "none";
      source.setAttribute("data-home-logo-docked", "");
      target.setAttribute("data-home-logo-docked", "");
    };

    const update = (now: number): void => {
      frame = undefined;
      if (disposed || phase !== "flying") return;
      const progress = Math.min(Math.max((now - startedAt) / 800, 0), 1);
      if (progress === 1 || getReducedMotionSnapshot()) {
        finish();
        return;
      }

      const start = source.getBoundingClientRect();
      const end = target.getBoundingClientRect();
      if (!start.width || !start.height || !end.width || !end.height) {
        finish();
        return;
      }
      const eased = progress * progress * (3 - 2 * progress);
      const arc = Math.sin(Math.PI * progress);
      const mix = (from: number, to: number): number => from + (to - from) * eased;
      const imageSource = source.currentSrc || source.src;
      if (flyingLogo.src !== imageSource) flyingLogo.src = imageSource;
      Object.assign(flyingLogo.style, {
        display: "block",
        width: `${mix(start.width, end.width)}px`,
        height: `${mix(start.height, end.height)}px`,
        transform: `translate3d(${mix(start.left, end.left)}px, ${mix(start.top, end.top) - arc * 24}px, 0) rotate(${-arc * 5}deg)`,
      });
      source.style.visibility = "hidden";
      frame = window.requestAnimationFrame(update);
    };

    function requestUpdate(): void {
      if (!disposed && phase === "flying" && frame === undefined) frame = window.requestAnimationFrame(update);
    }

    function trigger(): void {
      if (disposed || phase !== "waiting") return;
      phase = "flying";
      stopTriggers();
      if (getReducedMotionSnapshot()) finish();
      else {
        startedAt = performance.now();
        update(startedAt);
      }
    }

    function onScroll(): void {
      const currentScrollY = Math.max(window.scrollY, 0);
      const movedDown = currentScrollY > previousScrollY;
      previousScrollY = currentScrollY;
      if (movedDown) trigger();
    }

    target.removeAttribute("data-home-logo-docked");
    source.removeAttribute("data-home-logo-docked");
    source.style.visibility = "visible";
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", requestUpdate);
    visualViewport?.addEventListener("resize", requestUpdate);
    visualViewport?.addEventListener("scroll", requestUpdate);
    source.addEventListener("load", requestUpdate);
    target.addEventListener("load", requestUpdate);
    fonts?.addEventListener("loadingdone", requestUpdate);
    void fonts?.ready.then(() => { if (!disposed) requestUpdate(); });
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(requestUpdate);
    observer?.observe(source);
    observer?.observe(target);
    unsubscribe = subscribeToReducedMotion(() => { if (phase === "flying" && getReducedMotionSnapshot()) finish(); });
    timer = window.setTimeout(trigger, 6000);

    return () => {
      disposed = true;
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      stopTriggers();
      stopGeometry();
      flyingLogo.remove();
      if (initialVisibility) source.style.visibility = initialVisibility;
      else source.style.removeProperty("visibility");
      target.removeAttribute("data-home-logo-docked");
      source.removeAttribute("data-home-logo-docked");
    };
  }, []);

  return (
    <Image
      ref={logoRef}
      src="/newlogo.png"
      alt="Prime Taco Shop — Home of Tri-Tip Taco"
      width={3822}
      height={2378}
      sizes="(max-width: 799px) 280px, (max-width: 1023px) 320px, 360px"
      priority
      className="home-hero-logo"
    />
  );
}
