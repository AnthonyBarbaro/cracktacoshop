import { notFound, redirect } from "next/navigation";

import { locations } from "@/data/locations";
import { getMenuHref } from "@/lib/menu-link";

type MenuEmbedPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return locations.map((location) => ({ slug: location.slug }));
}

export default async function MenuEmbedPage({ params }: MenuEmbedPageProps): Promise<never> {
  const { slug } = await params;
  const location = locations.find((entry) => entry.slug === slug);
  if (!location) notFound();
  redirect(getMenuHref(location));
}
