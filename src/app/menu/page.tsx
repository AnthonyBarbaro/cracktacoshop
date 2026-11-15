import { permanentRedirect } from "next/navigation";

import { getMenuHref } from "@/lib/menu-link";

export default function MenuPage(): never {
  permanentRedirect(getMenuHref());
}
