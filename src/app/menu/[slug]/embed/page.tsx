import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DeliveryButton from "@/components/DeliveryButton";
import LocationOpenBadge from "@/components/LocationOpenBadge";
import SiteIcon from "@/components/SiteIcon";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getMenuForLocation } from "@/data/menu";
import { locations } from "@/data/locations";
import { site } from "@/data/site-content";

type MenuEmbedPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: MenuEmbedPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = locations.find((entry) => entry.slug === slug);

  if (!location) {
    return {
      title: "Menu Not Found",
    };
  }

  const canonicalUrl = `${site.url}/menu/${location.slug}/embed`;

  return {
    title: `${location.name} Menu`,
    description: `Browse the ${location.name} menu for tacos, burritos, and location-specific ordering links.`,
    alternates: {
      canonical: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${location.name} Menu | Prime Tacos`,
      description: `Browse the ${location.name} menu and choose pickup or delivery.`,
      images: [`${site.url}/newlogo.png`],
    },
    openGraph: {
      title: `${location.name} Menu | Prime Tacos`,
      description: `Order ${location.name} favorites online and view the latest menu categories.`,
      url: canonicalUrl,
      siteName: site.shortName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${site.url}/newlogo.png`,
          width: 3822,
          height: 2378,
          alt: "Prime Tacos",
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function MenuEmbedPage({ params }: MenuEmbedPageProps) {
  const { slug } = await params;
  const location = locations.find((entry) => entry.slug === slug);

  if (!location) {
    return notFound();
  }

  const menu = getMenuForLocation(slug);
  const hasMenuSections = menu.sections.length > 0;

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="page-main menu-detail-page">
        <div id="menu-top" className="section-shell">
          <header className="page-intro menu-detail-intro">
            <Link href="/menu" className="text-link">All menus<SiteIcon name="arrow" /></Link>
            <div className="menu-detail-heading">
              <div>
                <p className="page-kicker">The menu</p>
                <h1 className="page-title">{location.name}<span>.</span></h1>
              </div>
              <div className="menu-detail-meta">
                <LocationOpenBadge slug={location.slug} />
                <p>{location.address}</p>
                <p>{location.hours}</p>
              </div>
            </div>

            <div id="order-options" className="menu-detail-actions">
              {location.toastUrl && (
                <a
                  href={location.toastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-btn"
                >
                  Order pickup<SiteIcon name="bag" />
                </a>
              )}
              <DeliveryButton locationSlug={location.slug} className="brand-btn-muted">Order delivery<SiteIcon name="delivery" /></DeliveryButton>
              <Link href={`/locations/${location.slug}`} className="text-link">Location details<SiteIcon name="arrow" /></Link>
            </div>
            {hasMenuSections && (
              <p className="menu-price-note">
                {menu.priceSource === "printed-menu"
                  ? "From this shop’s printed menu. Confirm current prices and availability when ordering."
                  : "Mission Valley menu. Prices and availability may change when ordering."}
              </p>
            )}
          </header>

          {hasMenuSections ? (
            <>
              <nav aria-label="Menu categories" className="menu-category-nav">
                <div className="menu-category-links">
                  {menu.nav.map((section) => (
                    <a
                      key={section.sectionId}
                      href={`#${section.sectionId}`}
                      className="menu-category-link"
                    >
                      {section.label}
                    </a>
                  ))}
                </div>
              </nav>

              <div className="menu-book">
                {menu.sections.map((section, index) => (
                  <section
                    id={section.id}
                    key={section.id}
                    className="menu-category-section menu-book-section"
                  >
                    <div className="menu-section-heading">
                      <span className="menu-section-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <h2>{section.title}</h2>
                    </div>

                    <div className="menu-section-groups">
                      {section.groups.map((group) => (
                        <article
                          key={`${section.id}-${group.title}`}
                          className="menu-book-group"
                        >
                          <h3>{group.title}</h3>

                          <ul className="menu-items">
                            {group.items.map((item) => (
                              <li key={`${section.id}-${group.title}-${item.name}`} className="menu-item">
                                <div>
                                  <div className="menu-item-heading">
                                    <h4 className="menu-item-name">{item.name}</h4>
                                    {item.badge && (
                                      <span className="menu-item-badge">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="menu-item-description">{item.description}</p>
                                  )}
                                </div>
                                {item.priceOptions ? (
                                  <div className="menu-item-price-options">
                                    {item.priceOptions.map((option) => (
                                      <p key={option.label} className="menu-item-price-option">
                                        <span className="menu-item-price-label">{option.label}</span>
                                        <span className="menu-item-price">{option.price}</span>
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="menu-item-price">{item.price}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          ) : (
            <section className="menu-provider-panel" aria-labelledby="provider-menu-title">
              <div>
                <p className="page-kicker">Fresh from {location.name}</p>
                <h2 id="provider-menu-title">Your next favorite<br />is on the menu.</h2>
                <p>
                  Browse this shop’s current menu through pickup ordering, or choose delivery.
                </p>
              </div>

              {location.toastUrl && (
                <div>
                  <a
                    href={location.toastUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-btn"
                  >
                    Browse pickup menu<SiteIcon name="arrow" />
                  </a>
                  <p>Item availability and prices are confirmed before checkout.</p>
                </div>
              )}
            </section>
          )}

          {menu.printedMenuUrl && (
            <details className="menu-print-source">
              <summary>View the original printed menu</summary>
              <p>Published by the shop. Printed prices may differ from current pickup and delivery prices.</p>
              <a href={menu.printedMenuUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${location.name} printed menu at full size`}>
                <Image
                  src={menu.printedMenuUrl}
                  alt={`${location.name} printed menu. The items and prices are transcribed above.`}
                  width={location.slug === "encinitas" ? 2560 : 1000}
                  height={location.slug === "encinitas" ? 1525 : 1000}
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="block h-auto w-full"
                  unoptimized
                />
              </a>
              <a href={menu.printedMenuUrl} target="_blank" rel="noopener noreferrer" className="text-link">Open full-size menu<SiteIcon name="arrow" /></a>
            </details>
          )}

          <footer className="menu-detail-footer">
            {menu.notes.map((note) => (
              <p key={note}>
                {note}
              </p>
            ))}
            <a href="#menu-top" className="text-link">
              Back to top
            </a>
          </footer>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
