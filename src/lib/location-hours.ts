const LOCATION_HOURS: Record<string, { opens: string; closes: string }> = {
  "mission-valley": { opens: "07:00", closes: "00:00" },
  "seaport-village": { opens: "07:00", closes: "02:00" },
  encinitas: { opens: "08:00", closes: "23:00" },
  coronado: { opens: "08:00", closes: "02:00" },
};

const locationTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

type OpeningHoursSpecification = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
};

export function getLocationOpeningHoursSpecification(slug: string): OpeningHoursSpecification | undefined {
  const hours = LOCATION_HOURS[slug];
  if (!hours) return undefined;

  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    ...hours,
  };
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function getIsLocationOpenNow(slug: string, date: Date = new Date()): boolean | null {
  const hours = LOCATION_HOURS[slug];
  if (!hours) return null;

  const parts = locationTimeFormatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const nowMinutes = hour * 60 + minute;
  const openMinutes = toMinutes(hours.opens);
  const closeMinutes = toMinutes(hours.closes);

  if (closeMinutes <= openMinutes) {
    return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  }

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}
