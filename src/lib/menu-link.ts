import type { Location } from "@/data/locations";

export function getMenuHref(location?: Location): string {
  if (!location) {
    return "/menu";
  }

  return location.toastUrl ?? location.menuUrl ?? `/menu/${location.slug}/embed`;
}
