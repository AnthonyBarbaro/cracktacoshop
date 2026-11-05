import { redirect } from "next/navigation";

import { getMenuHref } from "@/lib/menu-link";

export default function MenuPage(): never {
  redirect(getMenuHref());
}
