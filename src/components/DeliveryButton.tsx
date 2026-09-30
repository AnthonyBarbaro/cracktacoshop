"use client";

import type { ReactElement, ReactNode } from "react";

import { openDeliveryOptions } from "@/lib/delivery-options";

type Props = {
  children: ReactNode;
  className?: string;
  locationSlug?: string;
};

export default function DeliveryButton({ children, className, locationSlug }: Props): ReactElement {
  return (
    <button type="button" className={className} onClick={() => openDeliveryOptions(locationSlug)} aria-haspopup="dialog" aria-controls="mobile-site-menu">
      {children}
    </button>
  );
}
