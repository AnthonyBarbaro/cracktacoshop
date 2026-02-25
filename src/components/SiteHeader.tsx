"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { locations } from "@/data/locations";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { findNearestLocationFromBrowser } from "@/lib/nearest-location";
import {
  getShoppingLocationSlugServerSnapshot,
  getShoppingLocationSlugSnapshot,
  subscribeToShoppingLocationChanges,
  setStoredShoppingLocationSlug,
  SHOPPING_LOCATION_CHANGE_EVENT,
} from "@/lib/shopping-location";

type Props = {
  ctaHref?: string;
  ctaLabel?: string;
};

function getRouteLocationSlug(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "locations" && segments[1]) {
    return segments[1];
  }

  if (segments[0] === "menu" && segments[1] && segments[2] === "embed") {
    return segments[1];
  }

  return undefined;
}

export default function SiteHeader({
  ctaHref = "/order-online",
  ctaLabel = "Order Online",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const routeLocationSlug = getRouteLocationSlug(pathname);
  const storedShoppingSlug = useSyncExternalStore(
    subscribeToShoppingLocationChanges,
    getShoppingLocationSlugSnapshot,
    getShoppingLocationSlugServerSnapshot,
  );
  const [menuLocationSlug, setMenuLocationSlug] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFindingNearest, setIsFindingNearest] = useState(false);
  const [nearestMessage, setNearestMessage] = useState<string | null>(null);
  const [nearestError, setNearestError] = useState<string | null>(null);
  const mobileMenuPanelRef = useRef<HTMLElement | null>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuToggleButtonRef = useRef<HTMLButtonElement | null>(null);

  const links = [
    { href: "/", label: "Home" },
    { href: "/locations", label: "Locations" },
    { href: "/menu", label: "Menu" },
    { href: "/our-story", label: "Our Story" },
    { href: "/reviews", label: "Reviews" },
    { href: "/careers", label: "Careers" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  const shoppingSlug = routeLocationSlug ?? storedShoppingSlug;
  const shoppingLocation = useMemo(
    () => locations.find((location) => location.slug === shoppingSlug),
    [shoppingSlug],
  );
  const menuLocation = useMemo(
    () => locations.find((location) => location.slug === menuLocationSlug),
    [menuLocationSlug],
  );
  const fallbackLocationSlug = locations[0]?.slug;
  const shoppingMenuHref = shoppingSlug
    ? `/menu/${shoppingSlug}/embed`
    : fallbackLocationSlug
      ? `/menu/${fallbackLocationSlug}/embed`
      : "/order-online";
  const primaryCtaHref = ctaHref === "/order-online" ? shoppingMenuHref : ctaHref;
  const drawerOrderHref = menuLocationSlug
    ? `/menu/${menuLocationSlug}/embed`
    : shoppingMenuHref;
  const drawerCtaHref = ctaHref === "/order-online" ? drawerOrderHref : ctaHref;

  const shoppingLabel = shoppingLocation?.name ?? "Select a location";
  const selectedDirectionsUrl = shoppingLocation
    ? getGoogleMapsDirectionsUrl({
        address: shoppingLocation.address,
        placeId: shoppingLocation.placeId,
        googleMapsUrl: shoppingLocation.googleMapsUrl,
      })
    : undefined;
  const menuDirectionsUrl = menuLocation
    ? getGoogleMapsDirectionsUrl({
        address: menuLocation.address,
        placeId: menuLocation.placeId,
        googleMapsUrl: menuLocation.googleMapsUrl,
      })
    : undefined;
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const openMenu = () => {
    setMenuLocationSlug(shoppingSlug ?? "");
    setNearestMessage(null);
    setIsMenuOpen(true);
    setNearestError(null);
  };

  const applyShoppingLocation = (slug: string) => {
    if (!slug) {
      return;
    }

    setStoredShoppingLocationSlug(slug);
    setNearestMessage(null);
    setNearestError(null);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setNearestMessage(null);
    setNearestError(null);
  };

  const handleViewSelectedLocation = () => {
    const targetSlug = menuLocationSlug || storedShoppingSlug || routeLocationSlug;

    if (!targetSlug) {
      return;
    }

    applyShoppingLocation(targetSlug);
    closeMenu();
    router.push(`/locations/${targetSlug}`);
  };

  const handleFindNearestLocation = async () => {
    setIsFindingNearest(true);
    setNearestMessage(null);
    setNearestError(null);

    const result = await findNearestLocationFromBrowser(locations);
    setIsFindingNearest(false);

    if (!result.ok) {
      if (result.reason === "permission-denied") {
        setNearestError(
          "Location permission is blocked. Enable location access and try again.",
        );
        return;
      }

      if (result.reason === "unsupported") {
        setNearestError("Location services are not available in this browser.");
        return;
      }

      if (result.reason === "timeout") {
        setNearestError("Location request timed out. Please try again or choose a store manually.");
        return;
      }

      setNearestError("We could not determine a nearby location.");
      return;
    }

    const nearestLocation = locations.find((location) => location.slug === result.slug);
    applyShoppingLocation(result.slug);
    setMenuLocationSlug(result.slug);
    setNearestMessage(
      nearestLocation ? `Nearest store selected: ${nearestLocation.name}.` : "Nearest store selected.",
    );
  };

  useEffect(() => {
    if (
      !routeLocationSlug ||
      !locations.some((location) => location.slug === routeLocationSlug)
    ) {
      return;
    }

    setStoredShoppingLocationSlug(routeLocationSlug);
  }, [routeLocationSlug]);

  useEffect(() => {
    const onShoppingLocationChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ slug?: string }>;
      const slug = customEvent.detail?.slug;

      if (slug && locations.some((location) => location.slug === slug)) {
        setMenuLocationSlug(slug);
      }
    };

    window.addEventListener(
      SHOPPING_LOCATION_CHANGE_EVENT,
      onShoppingLocationChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        SHOPPING_LOCATION_CHANGE_EVENT,
        onShoppingLocationChange as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const panel = mobileMenuPanelRef.current;

    if (!panel) {
      return;
    }

    const fallbackToggleButton = menuToggleButtonRef.current;
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    mobileMenuCloseButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
        setNearestError(null);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length === 0) {
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocusedElement) {
        previousFocusedElement.focus();
      } else {
        fallbackToggleButton?.focus();
      }
    };
  }, [isMenuOpen]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/78 backdrop-blur-md">
        <div className="section-shell flex h-16 items-center justify-between gap-3 sm:h-[4.5rem]">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="Crack Taco Shop"
              width={138}
              height={52}
              priority
              className="h-auto w-[112px] sm:w-[138px]"
            />
          </Link>

          <nav aria-label="Primary navigation" className="hidden gap-3 text-xs font-semibold text-white/80 xl:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isLinkActive(link.href) ? "page" : undefined}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden 2xl:flex items-center gap-2">
              <Link
                href={selectedDirectionsUrl ?? "/locations"}
                className="brand-btn-directions px-4 py-2 text-sm"
              >
                Get Directions
              </Link>

              <Link href={primaryCtaHref} className="brand-btn px-3 py-2 text-xs sm:px-4 sm:text-sm">
                {ctaLabel}
              </Link>

              <Link href="/locations" className="brand-btn-muted px-4 py-2 text-sm">
                Change Location
              </Link>
            </div>

            <button
              ref={menuToggleButtonRef}
              type="button"
              onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-black/45 text-white 2xl:hidden"
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-site-menu"
              aria-label="Toggle navigation menu"
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 top-0 block h-0.5 w-5 bg-current transition ${
                    isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] block h-0.5 w-5 bg-current transition ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[14px] block h-0.5 w-5 bg-current transition ${
                    isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/62">
          <div className="section-shell py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
              Shopping At: <span className="text-brand-yellow">{shoppingLabel}</span>
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:hidden">
              <Link
                href={selectedDirectionsUrl ?? "/locations"}
                className="brand-btn-directions min-h-10 px-3 py-2 text-xs"
              >
                Get Directions
              </Link>

              <Link href={primaryCtaHref} className="brand-btn min-h-10 px-3 py-2 text-xs">
                {ctaLabel}
              </Link>

              <button
                type="button"
                onClick={openMenu}
                className="brand-btn-muted col-span-2 min-h-10 px-3 py-2 text-xs sm:col-span-1"
              >
                Change Location
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 transition ${
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={closeMenu}
          className={`absolute inset-0 bg-black/70 transition-opacity ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close menu overlay"
        />

        <aside
          ref={mobileMenuPanelRef}
          id="mobile-site-menu"
          className={`absolute right-0 top-0 h-full w-[min(90vw,23rem)] overflow-y-auto border-l border-white/15 bg-[#0e0e0e] shadow-2xl shadow-black/50 transition-transform ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          aria-label="Mobile navigation panel"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <p id="mobile-menu-title" className="font-display text-2xl text-white">
              Menu
            </p>
            <button
              ref={mobileMenuCloseButtonRef}
              type="button"
              onClick={closeMenu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/45 text-xl text-white"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="space-y-5 p-4">
            <section className="rounded-2xl border border-white/12 bg-black/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                Shopping Location
              </p>
              <p className="mt-1 text-lg font-semibold text-white">{shoppingLabel}</p>

              <label htmlFor="header-location-picker" className="mt-3 block text-xs text-white/70">
                Choose location
              </label>
              <select
                id="header-location-picker"
                value={menuLocationSlug}
                onChange={(event) => {
                  const slug = event.target.value;
                  setMenuLocationSlug(slug);
                  applyShoppingLocation(slug);
                }}
                className="brand-input mt-2 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Select a location...
                </option>
                {locations.map((location) => (
                  <option key={location.slug} value={location.slug}>
                    {location.name}
                  </option>
                ))}
              </select>

              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleFindNearestLocation}
                  disabled={isFindingNearest}
                  className="brand-btn-directions w-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isFindingNearest ? "Finding nearest..." : "Use My Current Location"}
                </button>

                <button
                  type="button"
                  onClick={handleViewSelectedLocation}
                  disabled={!menuLocationSlug && !storedShoppingSlug && !routeLocationSlug}
                  className="brand-btn w-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45"
                >
                  View Location
                </button>

                <Link href={drawerCtaHref} onClick={closeMenu} className="brand-btn w-full px-4 py-2 text-sm">
                  {ctaLabel}
                </Link>

                {menuDirectionsUrl && (
                  <a
                    href={menuDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-btn-muted w-full px-4 py-2 text-sm"
                  >
                    Directions to {menuLocation?.name}
                  </a>
                )}

                {menuLocation?.phone && (
                  <a
                    href={`tel:${menuLocation.phone}`}
                    className="brand-btn-muted w-full px-4 py-2 text-sm"
                  >
                    Call {menuLocation.phone}
                  </a>
                )}
              </div>

              {(nearestMessage || nearestError) && (
                <p
                  role={nearestError ? "alert" : "status"}
                  className={`mt-3 text-xs ${nearestError ? "text-red-300" : "text-emerald-300"}`}
                >
                  {nearestError ?? nearestMessage}
                </p>
              )}
            </section>

            <nav aria-label="Site sections" className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isLinkActive(link.href) ? "page" : undefined}
                  onClick={closeMenu}
                  className="block rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/25 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
}
