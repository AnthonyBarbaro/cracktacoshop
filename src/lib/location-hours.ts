import { daysOfWeek, locations } from "@/data/locations";

const locationTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  weekday: "long",
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

export function getLocationOpeningHoursSpecification(slug: string): OpeningHoursSpecification | OpeningHoursSpecification[] | undefined {
  const hours = locations.find((location) => location.slug === slug)?.openingHours;
  if (!hours) return undefined;

  if (Array.isArray(hours)) {
    return hours.map((period) => ({ "@type": "OpeningHoursSpecification", ...period }));
  }

  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [...daysOfWeek],
    ...hours,
  };
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function getIsLocationOpenNow(slug: string, date: Date = new Date()): boolean | null {
  const hours = locations.find((location) => location.slug === slug)?.openingHours;
  if (!hours) return null;

  const parts = locationTimeFormatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const dayIndex = daysOfWeek.findIndex((day) => day === weekday);
  const previousDay = daysOfWeek[(dayIndex + daysOfWeek.length - 1) % daysOfWeek.length];
  const nowMinutes = hour * 60 + minute;
  const periods = Array.isArray(hours) ? hours : [{ ...hours, dayOfWeek: [...daysOfWeek] }];

  return periods.some((period) => {
    const today = period.dayOfWeek.some((day) => day === weekday);
    const yesterday = period.dayOfWeek.includes(previousDay);
    const openMinutes = toMinutes(period.opens);
    const closeMinutes = toMinutes(period.closes);

    if (closeMinutes <= openMinutes) {
      return (today && nowMinutes >= openMinutes) || (yesterday && nowMinutes < closeMinutes);
    }

    return today && nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  });
}
