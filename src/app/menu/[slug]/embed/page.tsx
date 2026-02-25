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
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }));
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
      <main id="main-content" className="min-h-screen pb-16 pt-10 text-white sm:pt-12">
        <div id="menu-top" className="section-shell space-y-4">
          <header className="rounded-2xl border border-white/15 bg-black/65 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-yellow">Our Menu</p>
            <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">{location.name}</h1>
            <p className="mt-2 text-sm text-white/80">{location.hours}</p>
            <p className="mt-1 text-sm text-white/70">
              {location.phone ? `Call us at ${location.phone}. ` : ""}
              Visit us at {location.address}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
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

            <p className="mt-3 text-xs text-white/55">
              Price source:{" "}
              {menu.priceSource === "manual"
                ? "Manual website pricing"
                : "Location-specific live/attached menus"}
            </p>
          </header>

          {hasManualSections ? (
            <>
              <nav className="sticky top-[7.9rem] z-20 overflow-hidden rounded-xl border border-white/12 bg-black/85 backdrop-blur-sm">
                <div className="flex gap-2 overflow-x-auto px-2 py-2 sm:flex-wrap sm:overflow-visible sm:px-3">
                  {menu.nav.map((section) => (
                    <a
                      key={section.sectionId}
                      href={`#${section.sectionId}`}
                      className="shrink-0 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:border-[#f0be3e]/60 hover:bg-[#f0be3e]/15"
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
                    className="rounded-2xl border border-white/12 bg-black/35 p-3 sm:p-4"
                  >
                    <h2 className="font-display text-2xl text-white sm:text-3xl">{section.title}</h2>

                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      {section.groups.map((group) => (
                        <article
                          key={`${section.id}-${group.title}`}
                          className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
                        >
                          <header className="border-b border-white/10 px-3 py-2">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                              {group.title}
                            </h3>
                          </header>

                          <ul className="divide-y divide-white/10">
                            {group.items.map((item) => (
                              <li key={`${section.id}-${group.title}-${item.name}`} className="px-3 py-2.5">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold text-white sm:text-base">{item.name}</p>
                                      {item.badge && (
                                        <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className="mt-1 text-xs text-white/70 sm:text-sm">{item.description}</p>
                                    )}
                                  </div>
                                  <p className="shrink-0 text-sm font-semibold text-brand-yellow sm:text-base">
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
            <section className="space-y-4 rounded-2xl border border-white/12 bg-black/35 p-4 sm:p-5">
              <div>
                <h2 className="font-display text-2xl text-white sm:text-3xl">Location-Specific Pricing</h2>
                <p className="mt-2 text-sm text-white/75">
                  {location.name} uses its own pricing. Use the linked live menus and attached menu
                  files below.
                </p>
              </div>

              {location.toastUrl && (
                <article className="rounded-xl border border-white/12 bg-black/70 p-4">
                  <h3 className="text-sm font-semibold text-white">Toast Online Ordering</h3>
                  <p className="mt-2 text-sm text-white/75">
                    Toast embeds are blocked on some devices and browsers. Open the location&apos;s
                    Toast menu directly.
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
                <article className="overflow-hidden rounded-xl border border-white/12 bg-black/70">
                  <header className="border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-semibold text-white">Attached Menu</p>
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
            <div className="rounded-xl border border-white/12 bg-black/45 px-4 py-3">
              {menu.notes.map((note) => (
                <p key={note} className="text-xs text-white/60">
                  {note}
                </p>
              ))}
              <p className="mt-1 text-xs text-white/45">{site.shortName}</p>
              <a
                href="#menu-top"
                className="mt-3 inline-flex rounded-lg border border-white/20 bg-white/6 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:border-[#f0be3e]/60 hover:bg-[#f0be3e]/15"
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
