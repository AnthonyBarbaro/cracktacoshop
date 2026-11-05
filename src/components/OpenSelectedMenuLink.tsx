"use client";

import type { ReactElement, ReactNode } from "react";

import { getMenuHref } from "@/lib/menu-link";
import { useShoppingLocation } from "@/lib/use-shopping-location";

type Props = {
  className?: string;
  label?: string;
  children?: ReactNode;
};

export default function OpenSelectedMenuLink({
  className,
  label = "Open Full Menu",
  children,
}: Props): ReactElement {
  const location = useShoppingLocation();

  return (
    <a href={getMenuHref(location)} className={className}>
      {children ?? label}
    </a>
  );
}
