import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
      title: "Menu Not Found | Prime Tacos",
    };
  }

  const canonicalUrl = `${site.url}/menu/${location.slug}/embed`;

  return {
    title: `${location.name} Menu | Prime Tacos`,
    description: `Browse the ${location.name} menu for tacos, burritos, and location-specific ordering links.`,
    alternates: {
      canonical: canonicalUrl,
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
          url: `${site.url}${location.image}`,
          width: 1600,
          height: 1000,
          alt: `${location.name} Prime Tacos menu`,
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
  const hasManualSections = menu.sections.length > 0;

  const quickLinks = [
    { name: "Toast Pickup", url: location.toastUrl, kind: "primary" as const },
    { name: "DoorDash", url: location.doorDash, kind: "muted" as const },
    { name: "GrubHub", url: location.grubHub, kind: "muted" as const },
    { name: "Uber Eats", url: location.uberEats, kind: "muted" as const },
  ].filter((entry): entry is { name: string; url: string; kind: "primary" | "muted" } =>
    Boolean(entry.url),
  );

  return (
    <>
      <SiteHeader ctaHref="/order-online" ctaLabel="Order Online" />
      <main id="main-content" className="min-h-screen pb-16 pt-10 text-neutral-950 sm:pt-12">
        <div id="menu-top" className="section-shell space-y-4">
          <header className="py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">Our Menu</p>
            <h1 className="mt-2 font-display text-3xl text-neutral-950 sm:text-4xl">{location.name}</h1>
            <p className="mt-2 text-sm text-neutral-600">{location.hours}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {location.phone ? `Call us at ${location.phone}. ` : ""}
              Visit us at {location.address}
            </p>

            <div id="order-options" className="mt-4 flex scroll-mt-24 flex-wrap gap-2">
              {quickLinks.map((entry) => (
                <a
                  key={entry.name}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    entry.kind === "primary"
                      ? "brand-btn w-full px-3 py-2 text-sm sm:w-auto"
                      : "brand-btn-muted w-full px-3 py-2 text-sm sm:w-auto"
                  }
                >
                  {entry.name}
                </a>
              ))}

              {menu.printedMenuUrl && (
                <a
                  href={menu.printedMenuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-btn-directions w-full px-3 py-2 text-sm sm:w-auto"
                >
                  View Attached Menu
                </a>
              )}
            </div>
          </header>

          {hasManualSections ? (
            <>
              <nav aria-label="Menu categories" className="sticky top-20 z-20 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <div className="flex gap-2 overflow-x-auto px-2 py-2 sm:flex-wrap sm:overflow-visible sm:px-3">
                  {menu.nav.map((section) => (
                    <a
                      key={section.sectionId}
                      href={`#${section.sectionId}`}
                      className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-950 hover:border-brand-green hover:bg-green-50"
                    >
                      {section.label}
                    </a>
                  ))}
                </div>
              </nav>

              <div className="space-y-4 pb-6">
                {menu.sections.map((section) => (
                  <section
                    id={section.id}
                    key={section.id}
                    className="scroll-mt-36 border-t border-neutral-200 py-5"
                  >
                    <h2 className="font-display text-2xl text-neutral-950 sm:text-3xl">{section.title}</h2>

                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      {section.groups.map((group) => (
                        <article
                          key={`${section.id}-${group.title}`}
                          className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
                        >
                          <header className="border-b border-neutral-200 px-3 py-2">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
                              {group.title}
                            </h3>
                          </header>

                          <ul className="divide-y divide-neutral-200">
                            {group.items.map((item) => (
                              <li key={`${section.id}-${group.title}-${item.name}`} className="px-3 py-2.5">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold text-neutral-950 sm:text-base">{item.name}</p>
                                      {item.badge && (
                                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-green">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className="mt-1 text-xs text-neutral-600 sm:text-sm">{item.description}</p>
                                    )}
                                  </div>
                                  <p className="shrink-0 text-sm font-semibold text-brand-green sm:text-base">
                                    {item.price}
                                  </p>
                                </div>
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
            <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 sm:p-5">
              <div>
                <h2 className="font-display text-2xl text-neutral-950 sm:text-3xl">View the menu</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Browse the {location.name} menu below or order online for current prices.
                </p>
              </div>

              {location.toastUrl && (
                <article className="rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-neutral-950">Toast Online Ordering</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    Choose your favorites and place a pickup order from {location.name}.
                  </p>
                  <a
                    href={location.toastUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-btn mt-3 inline-flex w-full px-4 py-2 text-sm sm:w-auto"
                  >
                    Open Toast Menu
                  </a>
                </article>
              )}

              {menu.printedMenuUrl && (
                <article className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <header className="border-b border-neutral-200 px-4 py-3">
                    <p className="text-sm font-semibold text-neutral-950">Attached Menu</p>
                  </header>
                  <a href={menu.printedMenuUrl} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={menu.printedMenuUrl}
                      alt={`${location.name} attached menu`}
                      width={1600}
                      height={2400}
                      className="block h-auto w-full"
                    />
                  </a>
                </article>
              )}
            </section>
          )}

          <footer>
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
              {menu.notes.map((note) => (
                <p key={note} className="text-xs text-neutral-600">
                  {note}
                </p>
              ))}
              <p className="mt-1 text-xs text-neutral-600">{site.shortName}</p>
              <a
                href="#menu-top"
                className="mt-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-950 hover:border-brand-green hover:bg-green-50"
              >
                Back to top
              </a>
            </div>
          </footer>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
