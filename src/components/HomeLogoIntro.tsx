"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, type ReactElement } from "react";

export default function HomeLogoIntro(): ReactElement {
  const logoRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const source = logoRef.current;
    const target = document.querySelector<HTMLImageElement>("[data-home-logo-target]");
    if (!source || !target) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let progress = Math.min(Math.max(window.scrollY, 0) / 420, 1);
    let previousTime = performance.now();

    // Keep the hero's space intact so docking never shifts the page.
    const flyingLogo = source.cloneNode() as HTMLImageElement;
    flyingLogo.removeAttribute("class");
    flyingLogo.removeAttribute("srcset");
    flyingLogo.removeAttribute("sizes");
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

    const update = (now: number): void => {
      frame = 0;
      const desiredProgress = Math.min(Math.max(window.scrollY, 0) / 420, 1);
      const elapsed = Math.min(now - previousTime, 64);
      previousTime = now;
      progress = preference.matches
        ? desiredProgress
        : progress + (desiredProgress - progress) * (1 - Math.exp(-elapsed / 160));
      if (Math.abs(desiredProgress - progress) < .001) {
        progress = desiredProgress;
      } else {
        frame = window.requestAnimationFrame(update);
      }
      const docked = progress === 1 || (preference.matches && progress > 0);
      target.toggleAttribute("data-home-logo-docked", docked);
      source.style.visibility = progress === 0 || (preference.matches && !docked) ? "visible" : "hidden";
      flyingLogo.style.display = progress > 0 && !docked ? "block" : "none";
      if (progress === 0 || docked) return;

      const start = source.getBoundingClientRect();
      const end = target.getBoundingClientRect();
      const eased = progress * progress * (3 - 2 * progress);
      const arc = Math.sin(Math.PI * progress);
      const mix = (from: number, to: number): number => from + (to - from) * eased;
      flyingLogo.src = source.currentSrc || source.src;
      Object.assign(flyingLogo.style, {
        width: `${mix(start.width, end.width)}px`,
        height: `${mix(start.height, end.height)}px`,
        transform: `translate3d(${mix(start.left, end.left)}px, ${mix(start.top + Math.max(window.scrollY, 0), end.top) - arc * 24}px, 0) rotate(${-arc * 5}deg)`,
      });
    };

    const requestUpdate = (): void => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update(performance.now());
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    source.addEventListener("load", requestUpdate);
    preference.addEventListener("change", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      flyingLogo.remove();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      source.removeEventListener("load", requestUpdate);
      preference.removeEventListener("change", requestUpdate);
      source.style.removeProperty("visibility");
      target.removeAttribute("data-home-logo-docked");
    };
  }, []);

  return (
    <Image
      ref={logoRef}
      src="/newlogo.png"
      alt="Prime Taco Shop — Home of Tri-Tip Taco"
      width={3822}
      height={2378}
      sizes="(max-width: 639px) 220px, 320px"
      priority
      className="home-hero-logo"
    />
  );
}
