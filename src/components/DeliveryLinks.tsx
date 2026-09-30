import Image from "next/image";
import type { ReactElement } from "react";

import type { Location } from "@/data/locations";

import styles from "./DeliveryLinks.module.css";

type DeliveryLinksProps = {
  location: Location;
  className?: string;
  variant?: "cards" | "rows";
};

export default function DeliveryLinks({
  location,
  className,
  variant = "cards",
}: DeliveryLinksProps): ReactElement | null {
  const providers = [
    { name: "Uber Eats", slug: "ubereats", href: location.uberEats },
    { name: "DoorDash", slug: "doordash", href: location.doorDash },
    { name: "Grubhub", slug: "grubhub", href: location.grubHub },
    { name: "Postmates", slug: "postmates", href: location.postmates },
  ];

  if (!providers.some((provider) => provider.href)) {
    return null;
  }

  return (
    <div className={`${styles.providers}${variant === "rows" ? ` ${styles.rows}` : ""}${className ? ` ${className}` : ""}`}>
      {providers.map((provider) => provider.href && (
        <a
          key={provider.name}
          href={provider.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${provider.name} delivery from ${location.name} (opens in a new tab)`}
          className={styles.provider}
          data-provider={provider.slug}
        >
          <span className={styles.logo} aria-hidden="true">
            <Image
              src={`/images/delivery/${provider.slug}.svg`}
              alt=""
              width={80}
              height={44}
              className={styles.logoImage}
            />
          </span>
          <span className={styles.details}>
            <span className={styles.name}>{provider.name}</span>
            <span className={styles.action}>
              {variant === "rows" ? "Delivered to your door" : "Order delivery"}
              {variant === "cards" && <span aria-hidden="true">↗</span>}
            </span>
          </span>
          {variant === "rows" && <span className={styles.rowArrow} aria-hidden="true">↗</span>}
        </a>
      ))}
    </div>
  );
}
