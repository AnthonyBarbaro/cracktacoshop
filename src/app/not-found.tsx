import Link from "next/link";
import type { ReactElement } from "react";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound(): ReactElement {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-main">
        <section className="section-shell page-intro">
          <p className="page-kicker">Page not found</p>
          <h1 className="page-title">Let’s get you to Prime.</h1>
          <p className="page-description">This page may have moved. Browse the menu or find your neighborhood shop.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="brand-btn px-6 py-3 text-sm">View menu</Link>
            <Link href="/locations" className="brand-btn-muted px-6 py-3 text-sm">Find a location</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
