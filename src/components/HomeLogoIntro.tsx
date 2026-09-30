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
    let timeout: number | undefined;
    let animation: Animation | undefined;
    let collapseAnimation: Animation | undefined;
    let flyingLogo: HTMLImageElement | undefined;
    let finished = false;

    ["visibility", "height", "margin-top", "margin-bottom"].forEach((property) => {
      source.style.removeProperty(property);
    });
    target.removeAttribute("data-home-logo-docked");

    const finish = (): void => {
      collapseAnimation?.cancel();
      collapseAnimation = undefined;
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      Object.assign(source.style, {
        visibility: "hidden",
        height: "0px",
        marginTop: "0px",
        marginBottom: "1.5rem",
      });
      target.setAttribute("data-home-logo-docked", "");
      animation?.cancel();
      flyingLogo?.remove();
    };

    const land = (): void => {
      if (finished) return;
      const style = window.getComputedStyle(source);
      const start = {
        height: `${source.getBoundingClientRect().height}px`,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
      };
      finish();
      collapseAnimation = source.animate([
        start,
        { height: "0px", marginTop: "0px", marginBottom: "1.5rem" },
      ], {
        duration: 450,
        easing: "cubic-bezier(.4, 0, .2, 1)",
      });
      collapseAnimation.onfinish = (): void => {
        collapseAnimation = undefined;
      };
    };

    const fly = (): void => {
      if (finished) return;
      const start = source.getBoundingClientRect();
      const end = target.getBoundingClientRect();
      if (!start.width || !start.height || !end.width || !end.height) {
        finish();
        return;
      }

      // A body-level copy can cross the hero's overflow and the sticky header.
      flyingLogo = source.cloneNode() as HTMLImageElement;
      flyingLogo.removeAttribute("class");
      flyingLogo.removeAttribute("srcset");
      flyingLogo.removeAttribute("sizes");
      flyingLogo.src = source.currentSrc || source.src;
      flyingLogo.alt = "";
      flyingLogo.setAttribute("aria-hidden", "true");
      flyingLogo.setAttribute("data-home-logo-flight", "");
      Object.assign(flyingLogo.style, {
        position: "fixed",
        top: `${start.top}px`,
        left: `${start.left}px`,
        width: `${start.width}px`,
        height: `${start.height}px`,
        maxWidth: "none",
        margin: "0",
        pointerEvents: "none",
        transformOrigin: "top left",
        zIndex: "45",
      });
      document.body.append(flyingLogo);
      source.style.visibility = "hidden";
      animation = flyingLogo.animate([
        { transform: "translate3d(0, 0, 0) scale(1)" },
        { transform: `translate3d(${end.left - start.left}px, ${end.top - start.top}px, 0) scale(${end.width / start.width}, ${end.height / start.height})` },
      ], {
        duration: 950,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "forwards",
      });
      animation.onfinish = land;
    };

    const schedule = (): void => {
      if (!finished && timeout === undefined) timeout = window.setTimeout(fly, 800);
    };

    if (preference.matches || window.scrollY > 0 || typeof source.animate !== "function") {
      finish();
    } else if (source.complete) {
      if (source.naturalWidth) schedule();
      else finish();
    } else {
      source.addEventListener("load", schedule, { once: true });
      source.addEventListener("error", finish, { once: true });
    }

    window.addEventListener("scroll", finish, { passive: true });
    window.addEventListener("resize", finish);
    preference.addEventListener("change", finish);

    return () => {
      finished = true;
      window.clearTimeout(timeout);
      animation?.cancel();
      collapseAnimation?.cancel();
      flyingLogo?.remove();
      source.removeEventListener("load", schedule);
      source.removeEventListener("error", finish);
      window.removeEventListener("scroll", finish);
      window.removeEventListener("resize", finish);
      preference.removeEventListener("change", finish);
      ["visibility", "height", "margin-top", "margin-bottom"].forEach((property) => {
        source.style.removeProperty(property);
      });
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
      sizes="(max-width: 639px) 200px, 280px"
      priority
      className="home-hero-logo"
    />
  );
}
