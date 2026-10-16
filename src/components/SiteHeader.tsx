"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactElement } from "react";

import DeliveryLinks from "@/components/DeliveryLinks";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteIcon from "@/components/SiteIcon";
import StoreLocationSearch from "@/components/StoreLocationSearch";
import StoreWelcome from "@/components/StoreWelcome";
import { locations } from "@/data/locations";
import { OPEN_DELIVERY_OPTIONS_EVENT } from "@/lib/delivery-options";
import { getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import {
  getShoppingLocationSlugServerSnapshot,
  getShoppingLocationSlugSnapshot,
  subscribeToShoppingLocationChanges,
  setStoredShoppingLocationSlug,
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
}: Props): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const isEditorial = pathname === "/";
  const routeLocationSlug = getRouteLocationSlug(pathname);
  const storedShoppingSlug = useSyncExternalStore(
    subscribeToShoppingLocationChanges,
    getShoppingLocationSlugSnapshot,
    getShoppingLocationSlugServerSnapshot,
  );
  const [nearestStoreSlug, setNearestStoreSlug] = useState<string | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<"menu" | "locations" | "welcome" | "delivery" | null>(null);
  const [deliveryLocationSlug, setDeliveryLocationSlug] = useState<string>("");
  const isMenuOpen = activeDrawer !== null;
  const isWelcomeOpen = activeDrawer === "welcome";
  const isDeliveryOpen = activeDrawer === "delivery";
  const isLocationPickerOpen = activeDrawer === "locations" || isWelcomeOpen;
  const mobileMenuPanelRef = useRef<HTMLElement | null>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const locationButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const links = [
    { href: "/menu", label: "Menu" },
    { href: "/locations", label: "Locations" },
    { href: "/order-online", label: "Order Online" },
    { href: "/catering", label: "Catering" },
  ];

  const shoppingSlug = routeLocationSlug ?? storedShoppingSlug;
  const shoppingLocation = useMemo(
    () => locations.find((location) => location.slug === shoppingSlug),
    [shoppingSlug],
  );
  const deliveryLocation = locations.find((location) => location.slug === (deliveryLocationSlug || shoppingSlug));
  const primaryCtaHref = ctaHref;
  const drawerCtaHref = ctaHref;

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
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const openMenu = () => {
    setActiveDrawer("menu");
  };

  const openLocationPicker = (): void => {
    setNearestStoreSlug(null);
    setActiveDrawer(shoppingLocation ? "locations" : "welcome");
  };

  const applyShoppingLocation = (slug: string) => {
    if (!slug) {
      return;
    }

    setStoredShoppingLocationSlug(slug);
  };

  const closeMenu = () => {
    setActiveDrawer(null);
  };

  const handleSelectStore = (slug: string): void => {
    applyShoppingLocation(slug);
    closeMenu();

    if (routeLocationSlug && routeLocationSlug !== slug) {
      router.push(pathname.startsWith("/menu/") ? `/menu/${slug}/embed` : `/locations/${slug}`);
    }
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
    const header = headerRef.current;
    if (!header || !isEditorial) return;
    const update = (): void => {
      header.classList.toggle("is-scrolled", window.scrollY > 60);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isEditorial]);

  useEffect(() => {
    const onOpenDelivery = (event: Event): void => {
      const slug = (event as CustomEvent<{ slug?: string }>).detail?.slug;
      setDeliveryLocationSlug(locations.find((location) => location.slug === slug)?.slug ?? "");
      setActiveDrawer("delivery");
    };

    window.addEventListener(OPEN_DELIVERY_OPTIONS_EVENT, onOpenDelivery);
    return () => window.removeEventListener(OPEN_DELIVERY_OPTIONS_EVENT, onOpenDelivery);
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
    if (activeDrawer === "welcome") {
      panel.querySelector<HTMLElement>("#mobile-menu-title")?.focus();
    } else {
      mobileMenuCloseButtonRef.current?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setActiveDrawer(null);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");

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
  }, [activeDrawer, isMenuOpen]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header ref={headerRef} className={`site-header is-editorial${isEditorial ? " is-home" : ""}`}>
        <div className="section-shell header-inner flex h-20 items-center justify-between gap-4">
          <Link href="/" className="shrink-0" aria-label="Prime Tacos home">
            <Image src="/newlogo.png" alt="Prime Taco Shop — Home of Tri-Tip Taco" width={3822} height={2378} sizes="(max-width: 639px) 106px, 152px" priority className="site-logo" data-home-logo-target />
          </Link>

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary navigation">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="header-link" aria-current={isLinkActive(link.href) ? "page" : undefined}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button ref={locationButtonRef} type="button" onClick={openLocationPicker} className="header-location inline-flex min-w-0 text-left" aria-label={shoppingLocation ? `Change store, ${shoppingLocation.name}` : "Choose a store"} aria-expanded={isLocationPickerOpen} aria-controls="mobile-site-menu" aria-haspopup="dialog">
              <span className="header-location-pin"><SiteIcon name="pin" className="h-5 w-5 shrink-0" /></span>
              <span className="header-location-copy min-w-0">
                {!shoppingLocation && <span className="header-location-eyebrow">Find your Prime</span>}
                <span className="header-location-label">{shoppingLabel}</span>
              </span>
              <span className="header-location-chevron" aria-hidden="true" />
            </button>
            <span className="hidden sm:inline-flex xl:hidden">
              <Link href={primaryCtaHref} className="brand-btn px-5 py-3 text-xs">
                {ctaLabel}
              </Link>
            </span>
            <button ref={menuToggleButtonRef} type="button" onClick={openMenu} className="menu-toggle shrink-0" aria-label="Open menu" aria-expanded={activeDrawer === "menu"} aria-controls="mobile-site-menu">
              <SiteIcon name="menu" className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <div className={`site-drawer-layer is-editorial ${isMenuOpen ? "is-open" : ""} ${isWelcomeOpen ? "is-welcome" : ""} ${isDeliveryOpen ? "is-delivery" : ""}`} inert={!isMenuOpen} aria-hidden={!isMenuOpen}>
        <button type="button" onClick={closeMenu} className="site-drawer-backdrop" aria-label={isDeliveryOpen ? "Close delivery options overlay" : isLocationPickerOpen ? "Close store selector overlay" : "Close menu overlay"} tabIndex={-1} />
        <aside ref={mobileMenuPanelRef} id="mobile-site-menu" className={`site-drawer ${isWelcomeOpen ? "store-welcome-dialog" : ""}${isDeliveryOpen ? " delivery-drawer" : ""}`} role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" aria-describedby={isDeliveryOpen ? "delivery-description" : isLocationPickerOpen ? "store-picker-description" : undefined}>
          {isWelcomeOpen ? (
            <>
              <button ref={mobileMenuCloseButtonRef} type="button" onClick={closeMenu} className="menu-toggle store-welcome-close" aria-label="Close store selector">
                <SiteIcon name="close" />
              </button>
              <StoreWelcome onSelectStore={handleSelectStore} onBrowse={closeMenu} />
            </>
          ) : isDeliveryOpen ? (
            <div className="delivery-dialog-header">
              <div className="delivery-dialog-topline">
                <span className="delivery-dialog-kicker"><SiteIcon name="delivery" />Prime, to your door</span>
                <button ref={mobileMenuCloseButtonRef} type="button" onClick={closeMenu} className="delivery-dialog-close" aria-label="Close delivery options">
                  <SiteIcon name="close" />
                </button>
              </div>
              <h2 id="mobile-menu-title">Tacos, <em>delivered.</em></h2>
              <p id="delivery-description">{deliveryLocation ? "Your favorite order. Your favorite delivery service." : "Choose your location, then your delivery service."}</p>
            </div>
          ) : (
            <div className="drawer-heading">
              <h2 id="mobile-menu-title" className="drawer-title">{isLocationPickerOpen ? "Change store" : "Prime Tacos"}</h2>
              <button ref={mobileMenuCloseButtonRef} type="button" onClick={closeMenu} className="menu-toggle shrink-0" aria-label={isLocationPickerOpen ? "Close store selector" : "Close menu"}>
                <SiteIcon name="close" />
              </button>
            </div>
          )}

          {isWelcomeOpen ? null : isDeliveryOpen ? (
            <div className="delivery-drawer-content">
              <div className="delivery-store-select">
                <span className="delivery-store-pin"><SiteIcon name="pin" /></span>
                <div className="delivery-store-field">
                  <label htmlFor="delivery-location">Ordering from</label>
                  <select id="delivery-location" value={deliveryLocation?.slug ?? ""} onChange={(event) => {
                    const slug = event.target.value;
                    setDeliveryLocationSlug(slug);
                    applyShoppingLocation(slug);
                  }} className="delivery-location-select">
                    <option value="" disabled>Select a location</option>
                    {locations.map((location) => <option key={location.slug} value={location.slug}>{location.name}</option>)}
                  </select>
                  {deliveryLocation && <p>{deliveryLocation.address}</p>}
                </div>
              </div>
              {deliveryLocation ? (
                <section className="delivery-service-list" aria-labelledby="delivery-services-title">
                  <h3 id="delivery-services-title">Choose your delivery service</h3>
                  <DeliveryLinks location={deliveryLocation} variant="rows" />
                </section>
              ) : (
                <div className="delivery-empty-state">
                  <SiteIcon name="delivery" className="h-8 w-8" />
                  <h3>A few taps from taco time.</h3>
                  <p>Select a shop above to see its delivery options.</p>
                </div>
              )}
              <p className="delivery-drawer-note">You’ll finish your order with your selected service.<span>Availability and fees depend on your address.</span></p>
            </div>
          ) : isLocationPickerOpen ? (
            <>
              <div className="store-switch-summary">
                <p className="eyebrow">Your current store</p>
                <strong>{shoppingLocation?.name}</strong>
                <p id="store-picker-description">Choose another location below.</p>
              </div>
              <StoreLocationSearch onNearestLocation={setNearestStoreSlug} />
              <ul className="store-picker-list" aria-label="Stores">
                {pickerLocations.map((location) => {
                  const isSelected = location.slug === shoppingSlug;

                  return (
                    <li key={location.slug}>
                      <button type="button" onClick={() => handleSelectStore(location.slug)} className="store-picker-card" aria-pressed={isSelected} aria-label={`${isSelected ? "Current store:" : "Switch to"} ${location.name}`} aria-describedby={`store-${location.slug}-status store-${location.slug}-details`}>
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-base font-extrabold">{location.name}</span>
                          <span id={`store-${location.slug}-status`}><LocationOpenBadge slug={location.slug} /></span>
                        </span>
                        <span id={`store-${location.slug}-details`} className="mt-2 block text-neutral-600">
                          <span className="block text-sm">{location.address}</span>
                          <span className="block text-xs">{location.hours}</span>
                        </span>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold text-brand-green">
                          {isSelected ? "Current store" : "Switch to this store"}
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
                    <Link key={link.href} href={link.href} aria-current={isLinkActive(link.href) ? "page" : undefined} onClick={closeMenu}>
                    {link.label}<SiteIcon name="arrow" />
                  </Link>
                ))}
              </nav>

              <section className="drawer-location" aria-label="Your location and ordering">
                <p className="eyebrow">Your location</p>
                <button type="button" onClick={openLocationPicker} className="drawer-store-button" aria-haspopup="dialog">
                  <SiteIcon name="pin" />
                  <span>{shoppingLabel}</span>
                  <SiteIcon name="arrow" />
                </button>
                {shoppingLocation && <p className="drawer-store-address">{shoppingLocation.address}</p>}
                <Link href={drawerCtaHref} onClick={closeMenu} className="brand-btn drawer-order">{ctaLabel}<SiteIcon name="arrow" /></Link>
              </section>
            </>
          )}
        </aside>
      </div>

      <nav aria-label="Mobile quick actions" className="mobile-bottom-bar is-editorial" inert={isMenuOpen}>
        {shoppingLocation?.phone ? (
          <a href={`tel:${shoppingLocation.phone}`} aria-label={`Call ${shoppingLocation.name}`}><SiteIcon name="phone" /><span>Call</span></a>
        ) : (
          <Link href={isEditorial ? "/#locations" : "/locations"} aria-label="Choose a location to call"><SiteIcon name="phone" /><span>Call</span></Link>
        )}
        <a href={selectedDirectionsUrl ?? (isEditorial ? "/#locations" : "/locations")} target={selectedDirectionsUrl ? "_blank" : undefined} rel={selectedDirectionsUrl ? "noopener noreferrer" : undefined}><SiteIcon name="pin" /><span>Directions</span></a>
        <Link href="/menu"><SiteIcon name="menu" /><span>Menu</span></Link>
        <button type="button" onClick={() => {
          setDeliveryLocationSlug("");
          setActiveDrawer("delivery");
        }} className="is-featured" aria-haspopup="dialog" aria-controls="mobile-site-menu" aria-expanded={isDeliveryOpen}><SiteIcon name="delivery" /><span>Delivery</span></button>
      </nav>
    </>
  );
}
