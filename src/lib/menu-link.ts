import { locations, type Location } from "@/data/locations";

export function getMenuHref(location?: Location): string {
  const menuUrl = location?.toastUrl ?? locations[0]?.toastUrl;
  if (!menuUrl) throw new Error("A Toast menu URL must be configured.");
  return menuUrl;
}
