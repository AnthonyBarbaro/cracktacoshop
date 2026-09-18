"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteIcon from "@/components/SiteIcon";
import StoreLocationSearch from "@/components/StoreLocationSearch";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";
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

const LOCATION_PROMPT_SESSION_KEY = "cts-location-prompt-shown";

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
  const [nearestStoreSlug, setNearestStoreSlug] = useState<string | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<"menu" | "locations" | null>(null);
  const isMenuOpen = activeDrawer !== null;
  const isLocationPickerOpen = activeDrawer === "locations";
  const [isFindingNearest, setIsFindingNearest] = useState(false);
  const [nearestError, setNearestError] = useState<string | null>(null);
  const mobileMenuPanelRef = useRef<HTMLElement | null>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const locationButtonRef = useRef<HTMLButtonElement | null>(null);
  const locationPromptHandledRef = useRef(false);
  const markLocationPromptHandled = useCallback((): void => {
    locationPromptHandledRef.current = true;
    try {
      window.sessionStorage.setItem(LOCATION_PROMPT_SESSION_KEY, "true");
    } catch {
      // The ref still prevents repeated prompts when session storage is unavailable.
    }
  }, []);

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
  const shoppingMenuHref = shoppingLocation
    ? `/menu/${shoppingLocation.slug}/embed`
    : "/order-online";
  const primaryCtaHref = ctaHref === "/order-online" ? shoppingMenuHref : ctaHref;
  const drawerOrderHref = menuLocationSlug
    ? `/menu/${menuLocationSlug}/embed`
    : shoppingMenuHref;
  const drawerCtaHref = ctaHref === "/order-online" ? drawerOrderHref : ctaHref;

  const shoppingLabel = shoppingLocation?.name ?? "Select a location";
  const pickerLocations = nearestStoreSlug
    ? [...locations].sort((a, b) => Number(b.slug === nearestStoreSlug) - Number(a.slug === nearestStoreSlug))
    : locations;
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
  const getNavigationHref = (href: string): string => (
    href === "/menu" && shoppingLocation ? shoppingMenuHref : href
  );

  const openMenu = () => {
    markLocationPromptHandled();
    setMenuLocationSlug(shoppingSlug ?? "");
    setActiveDrawer("menu");
    setNearestError(null);
  };

  const openLocationPicker = (): void => {
    markLocationPromptHandled();
    setNearestStoreSlug(null);
    setActiveDrawer("locations");
  };

  const applyShoppingLocation = (slug: string) => {
    if (!slug) {
      return;
    }

    setStoredShoppingLocationSlug(slug);
    setNearestError(null);
  };

  const closeMenu = () => {
    setActiveDrawer(null);
    setNearestError(null);
  };

  const handleSelectStore = (slug: string): void => {
    applyShoppingLocation(slug);
    closeMenu();

    if (routeLocationSlug && routeLocationSlug !== slug) {
      router.push(pathname.startsWith("/menu/") ? `/menu/${slug}/embed` : `/locations/${slug}`);
    }
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

    handleSelectStore(result.slug);
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
    if (activeDrawer || shoppingLocation || locationPromptHandledRef.current) {
      return;
    }

    try {
      if (window.sessionStorage.getItem(LOCATION_PROMPT_SESSION_KEY) === "true") {
        locationPromptHandledRef.current = true;
        return;
      }
    } catch {
      // Continue using the in-memory guard if session storage is unavailable.
    }

    const timeoutId = window.setTimeout(() => {
      const savedSlug = getShoppingLocationSlugSnapshot();
      const hasLocation = locations.some((location) => (
        location.slug === routeLocationSlug || location.slug === savedSlug
      ));

      if (hasLocation || locationPromptHandledRef.current) {
        return;
      }

      markLocationPromptHandled();
      setNearestStoreSlug(null);
      setActiveDrawer("locations");
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeDrawer, shoppingLocation, routeLocationSlug, markLocationPromptHandled]);

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
    const fallbackLocationButton = locationButtonRef.current;
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    mobileMenuCloseButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setActiveDrawer(null);
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
      if (previousFocusedElement && previousFocusedElement !== document.body && previousFocusedElement.isConnected) {
        previousFocusedElement.focus();
      } else {
        (fallbackLocationButton ?? fallbackToggleButton)?.focus();
      }
    };
  }, [isMenuOpen]);

  const phone = shoppingLocation?.phone ?? site.phone;
  const deliveryHref = shoppingLocation && (shoppingLocation.doorDash || shoppingLocation.grubHub || shoppingLocation.uberEats)
    ? `/menu/${shoppingLocation.slug}/embed#order-options`
    : "/order-online";

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="site-header">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          <Link href="/" className="shrink-0" aria-label="Prime Tacos home">
            <Image src="/newlogo.png" alt="Prime Tacos" width={3822} height={2378} sizes="106px" priority className="site-logo" />
          </Link>

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary navigation">
            {links.filter((link) => !["/", "/faq", "/careers"].includes(link.href)).map((link) => (
              <Link key={link.href} href={getNavigationHref(link.href)} className="header-link" aria-current={isLinkActive(link.href) ? "page" : undefined}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button ref={locationButtonRef} type="button" onClick={openLocationPicker} className="header-location inline-flex min-w-0 text-left" aria-expanded={isLocationPickerOpen} aria-controls="mobile-site-menu" aria-haspopup="dialog">
              <SiteIcon name="pin" className="h-5 w-5 shrink-0" />
              <span className="min-w-0 leading-tight">{shoppingLabel}</span>
            </button>
            <Link href={primaryCtaHref} className="brand-btn hidden px-5 py-3 text-xs md:inline-flex">
              {ctaLabel}
            </Link>
            <button ref={menuToggleButtonRef} type="button" onClick={openMenu} className="menu-toggle shrink-0" aria-label="Open menu" aria-expanded={activeDrawer === "menu"} aria-controls="mobile-site-menu">
              <SiteIcon name="menu" className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <div className={`site-drawer-layer ${isMenuOpen ? "is-open" : ""}`} inert={!isMenuOpen} aria-hidden={!isMenuOpen}>
        <button type="button" onClick={closeMenu} className="site-drawer-backdrop" aria-label={isLocationPickerOpen ? "Close store selector overlay" : "Close menu overlay"} tabIndex={-1} />
        <aside ref={mobileMenuPanelRef} id="mobile-site-menu" className="site-drawer" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" aria-describedby={isLocationPickerOpen && !shoppingLocation ? "store-picker-description" : undefined}>
          <div className="flex items-center justify-between border-b border-black/15 pb-4">
            <p id="mobile-menu-title" className="font-display text-xl">{isLocationPickerOpen ? "Choose a Store" : "Prime Tacos"}</p>
            <button ref={mobileMenuCloseButtonRef} type="button" onClick={closeMenu} className="menu-toggle shrink-0" aria-label={isLocationPickerOpen ? "Close store selector" : "Close menu"}>
              <SiteIcon name="close" />
            </button>
          </div>

          {isLocationPickerOpen ? (
            <>
              {!shoppingLocation && <p id="store-picker-description" className="mt-4 text-sm text-neutral-600">Select a store to see its menu, hours, and ordering options.</p>}
              <StoreLocationSearch onNearestLocation={setNearestStoreSlug} />
              <ul className="store-picker-list" aria-label="Stores">
                {pickerLocations.map((location) => {
                  const isSelected = location.slug === shoppingSlug;

                  return (
                    <li key={location.slug}>
                      <button type="button" onClick={() => handleSelectStore(location.slug)} className="store-picker-card" aria-pressed={isSelected} aria-label={`${isSelected ? "Selected store:" : "Select store:"} ${location.name}`} aria-describedby={`store-${location.slug}-status store-${location.slug}-details`}>
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-base font-extrabold">{location.name}</span>
                          <span id={`store-${location.slug}-status`}><LocationOpenBadge slug={location.slug} /></span>
                        </span>
                        <span id={`store-${location.slug}-details`} className="mt-2 block text-neutral-600">
                          <span className="block text-sm">{location.address}</span>
                          <span className="block text-xs">{location.hours}</span>
                          {location.phone && <span className="block text-xs">{location.phone}</span>}
                        </span>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold text-brand-green">
                          {isSelected ? "Selected" : "Select this store"}
                          {!isSelected && <SiteIcon name="arrow" className="h-4 w-4" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <>
              <nav aria-label="Site sections" className="drawer-links">
                {links.map((link) => (
                    <Link key={link.href} href={getNavigationHref(link.href)} aria-current={isLinkActive(link.href) ? "page" : undefined} onClick={closeMenu}>
                    {link.label}<SiteIcon name="arrow" />
                  </Link>
                ))}
              </nav>

              <section className="drawer-location">
                <label htmlFor="header-location-picker" className="eyebrow">Your location</label>
                <select id="header-location-picker" value={menuLocationSlug} onChange={(event) => {
                  const slug = event.target.value;
                  handleSelectStore(slug);
                }} className="brand-input mt-3 px-3 py-3 text-sm">
                  <option value="" disabled>Choose a location</option>
                  {locations.map((location) => <option key={location.slug} value={location.slug}>{location.name}</option>)}
                </select>
                <button type="button" onClick={handleFindNearestLocation} disabled={isFindingNearest} className="mt-3 min-h-11 text-sm font-bold text-brand-green disabled:opacity-50">
                  {isFindingNearest ? "Finding nearest…" : "Use my current location"}
                </button>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href={drawerCtaHref} onClick={closeMenu} className="brand-btn px-3 py-3 text-xs">{ctaLabel}</Link>
                  <button type="button" onClick={handleViewSelectedLocation} disabled={!menuLocationSlug && !storedShoppingSlug && !routeLocationSlug} className="brand-btn-muted px-3 py-3 text-xs disabled:opacity-45">View location</button>
                </div>
                {menuDirectionsUrl && <a href={menuDirectionsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-green"><SiteIcon name="pin" />Directions to {menuLocation?.name}</a>}
                {nearestError && <p role="alert" className="mt-3 text-sm text-brand-red">{nearestError}</p>}
              </section>
            </>
          )}
        </aside>
      </div>

      {shoppingLocation && (
        <nav aria-label="Mobile quick actions" className="mobile-bottom-bar" inert={isMenuOpen}>
          <a href={`tel:${phone}`} aria-label={`Call ${shoppingLocation.name}`}><SiteIcon name="phone" /><span>Call</span></a>
          <Link href={shoppingMenuHref} className="is-featured"><SiteIcon name="bag" /><span>Order online</span></Link>
          <Link href={deliveryHref}><SiteIcon name="delivery" /><span>Delivery</span></Link>
          <Link href={selectedDirectionsUrl ?? "/locations"} target={selectedDirectionsUrl ? "_blank" : undefined} rel={selectedDirectionsUrl ? "noopener noreferrer" : undefined}><SiteIcon name="pin" /><span>Directions</span></Link>
        </nav>
      )}
    </>
  );
}
