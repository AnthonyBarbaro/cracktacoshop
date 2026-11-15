import type { Location } from "@/data/locations";
import { getLocationFoodPhoto, site } from "@/data/site-content";
import { getLocationOpeningHoursSpecification } from "@/lib/location-hours";
import { getMenuHref } from "@/lib/menu-link";

export function getLocationRestaurantSchema(location: Location): Record<string, unknown> | undefined {
  // A Restaurant needs a resolved address; do not publish a guessed street number.
  if (!location.streetAddress) return undefined;

  const url = `${site.url}/locations/${location.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}#restaurant`,
    name: `${site.name} ${location.name}`,
    url,
    image: `${site.url}${getLocationFoodPhoto(location.slug).src}`,
    telephone: location.phoneNeedsConfirmation ? undefined : location.phone,
    servesCuisine: "Mexican",
    address: {
      "@type": "PostalAddress",
      streetAddress: location.streetAddress,
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.postalCode,
      addressCountry: "US",
    },
    openingHoursSpecification: getLocationOpeningHoursSpecification(location.slug),
    hasMenu: getMenuHref(location),
    parentOrganization: { "@id": `${site.url}/#organization` },
    sameAs: [site.instagram],
  };
}
