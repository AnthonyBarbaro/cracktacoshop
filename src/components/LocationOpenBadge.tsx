"use client";

import { useEffect, useState } from "react";

const LOCATION_HOURS: Record<string, { openMinutes: number; closeMinutes: number }> = {
  "mission-valley": { openMinutes: 7 * 60, closeMinutes: 24 * 60 },
  "seaport-village": { openMinutes: 7 * 60, closeMinutes: 2 * 60 },
  encinitas: { openMinutes: 8 * 60, closeMinutes: 23 * 60 },
  coronado: { openMinutes: 8 * 60, closeMinutes: 2 * 60 },
};

const LOCATION_TIME_ZONE = "America/Los_Angeles";

function getMinutesInLocationTimeZone(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: LOCATION_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return hour * 60 + minute;
}

function getIsOpenNow(slug: string): boolean | null {
  const hours = LOCATION_HOURS[slug];

  if (!hours) {
    return null;
  }

  const nowMinutes = getMinutesInLocationTimeZone(new Date());

  if (hours.closeMinutes <= hours.openMinutes) {
    return nowMinutes >= hours.openMinutes || nowMinutes < hours.closeMinutes;
  }

  return nowMinutes >= hours.openMinutes && nowMinutes < hours.closeMinutes;
}

type Props = {
  slug: string;
};

export default function LocationOpenBadge({ slug }: Props) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setIsOpen(getIsOpenNow(slug));
    };

    updateStatus();
    const intervalId = window.setInterval(updateStatus, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [slug]);

  if (isOpen === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70">
        <span className="h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden="true" />
        Hours
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
        isOpen
          ? "border-emerald-300/45 bg-emerald-500/12 text-emerald-300"
          : "border-red-300/45 bg-red-500/12 text-red-300"
      }`}
      aria-live="polite"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-emerald-300" : "bg-red-300"}`}
        aria-hidden="true"
      />
      {isOpen ? "Open now" : "Closed now"}
    </span>
  );
}
