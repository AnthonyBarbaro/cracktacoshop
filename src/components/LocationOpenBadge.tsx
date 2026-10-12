"use client";

import { useEffect, useState } from "react";
import { getIsLocationOpenNow } from "@/lib/location-hours";

type Props = {
  slug: string;
};

export default function LocationOpenBadge({ slug }: Props) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setIsOpen(getIsLocationOpenNow(slug));
    };

    updateStatus();
    const intervalId = window.setInterval(updateStatus, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [slug]);

  if (isOpen === null) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-600">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" aria-hidden="true" />
        Hours
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
        isOpen
          ? "border-green-200 bg-green-50 text-brand-green"
          : "border-red-200 bg-red-50 text-brand-red"
      } shrink-0 whitespace-nowrap`}
      aria-live="polite"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-brand-green" : "bg-brand-red"}`}
        aria-hidden="true"
      />
      {isOpen ? "Open now" : "Closed now"}
    </span>
  );
}
