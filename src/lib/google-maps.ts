type MapsLocation = {
  address: string;
  placeId?: string;
  googleMapsUrl?: string;
};

type MapsDirectionsOptions = MapsLocation & {
  origin?: string;
};

type MapsEmbedOptions = MapsLocation & {
  apiKey?: string;
};

export function getGoogleMapsSearchUrl({
  address,
  placeId,
  googleMapsUrl,
}: MapsLocation): string {
  const normalizedGoogleMapsUrl = googleMapsUrl?.trim();
  if (normalizedGoogleMapsUrl) {
    return normalizedGoogleMapsUrl;
  }

  const normalizedPlaceId = placeId?.trim();
  const query = encodeURIComponent(address);

  if (normalizedPlaceId) {
    return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(normalizedPlaceId)}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getGoogleMapsDirectionsUrl({
  address,
  placeId,
  googleMapsUrl,
  origin,
}: MapsDirectionsOptions): string {
  const normalizedGoogleMapsUrl = googleMapsUrl?.trim();
  if (normalizedGoogleMapsUrl) {
    return normalizedGoogleMapsUrl;
  }

  const normalizedPlaceId = placeId?.trim();
  const destination = encodeURIComponent(address);
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : "";

  if (normalizedPlaceId) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}${originParam}&destination_place_id=${encodeURIComponent(normalizedPlaceId)}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${destination}${originParam}`;
}

export function getGoogleMapsEmbedUrl({
  address,
  placeId,
  apiKey,
}: MapsEmbedOptions): string {
  const normalizedPlaceId = placeId?.trim();
  const normalizedApiKey = apiKey?.trim();
  const query = normalizedPlaceId ? `place_id:${normalizedPlaceId}` : address;

  if (normalizedApiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(normalizedApiKey)}&q=${encodeURIComponent(query)}`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
