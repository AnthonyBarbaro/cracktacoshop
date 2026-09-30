"use client";

import Link from "next/link";

import { getMenuHref } from "@/lib/menu-link";
import { useShoppingLocation } from "@/lib/use-shopping-location";

type Props = {
  className?: string;
  label?: string;
};

export default function OpenSelectedMenuLink({
  className,
  label = "Open Full Menu",
}: Props) {
  const location = useShoppingLocation();

  return (
    <Link href={getMenuHref(location)} className={className}>
      {label}
    </Link>
  );
}
