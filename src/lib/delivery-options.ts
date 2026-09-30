export const OPEN_DELIVERY_OPTIONS_EVENT = "prime-open-delivery-options";

export function openDeliveryOptions(slug?: string): void {
  window.dispatchEvent(new CustomEvent(OPEN_DELIVERY_OPTIONS_EVENT, { detail: { slug } }));
}
