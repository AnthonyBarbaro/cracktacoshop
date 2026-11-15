export type Location = {
  slug: string;
  name: string;
  phone?: string;
  placeId: string;
  googleMapsUrl?: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  postalCode: string;
  address: string;
  hours: string;
  openingHours?: { opens: string; closes: string };
  streetAddress?: string;
  phoneNeedsConfirmation?: boolean;
  seoTitle: string;
  description: string;
  introduction: string;
  menuHighlights: string[];
  image: string;
  menuUrl?: string;
  toastUrl?: string;
  doorDash?: string;
  grubHub?: string;
  uberEats?: string;
  postmates?: string;
};

const locationDetails: Omit<Location, "hours" | "address">[] = [
  {
    slug: "mission-valley",
    name: "Mission Valley",
    phone: "619-269-2828",
    placeId: "ChIJOc3z-bdV2YARQp5C72Q2NDI",
    googleMapsUrl:
      "https://www.google.com/maps/place/Crack+Taco+Shop/@32.7802181,-117.1035112,21z/data=!4m15!1m8!3m7!1s0x80d955b7f9f3cd39:0x32343664ef429e42!2s4242+Camino+Del+Rio+N,+San+Diego,+CA+92108!3b1!8m2!3d32.78!4d-117.1041249!16s%2Fg%2F11bw3x37pm!3m5!1s0x80d9554c45546781:0x669da21529a05b35!8m2!3d32.7802336!4d-117.103017!16s%2Fg%2F11fll1p4nm?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
    latitude: 32.7802336,
    longitude: -117.103017,
    city: "San Diego",
    state: "CA",
    postalCode: "92108",
    streetAddress: "4242 Camino Del Rio N",
    openingHours: { opens: "07:00", closes: "00:00" },
    phoneNeedsConfirmation: true,
    seoTitle: "Mission Valley Tacos & Burritos | Prime Taco Shop",
    description: "Find tri-tip tacos, burritos and breakfast at Prime Taco Shop in Mission Valley, San Diego. View the menu, order pickup, call or get directions.",
    introduction: "Visit Prime Taco Shop in Mission Valley for burgundy pepper tri-tip tacos and burritos. The menu also includes breakfast burritos and bowls. Check the ordering menu for current items and breakfast availability.",
    menuHighlights: ["Tri-tip tacos", "Tri-tip burritos", "Tri-tip breakfast burritos", "Breakfast bowls"],
    image: "/images/mission.jpg",
    menuUrl: "/menu/mission-valley/embed",
    toastUrl:
      "https://order.toasttab.com/online/crack-taco-mission-valley-4242-camino-del-rio-north-28",
    doorDash:
      "https://www.doordash.com/store/crack-taco-shop-san-diego-841981/44392947/",
    grubHub:
      "https://www.grubhub.com/restaurant/crack-taco-shop-4242-camino-del-rio-n-ste-28-san-diego/1397766",
    uberEats:
      "https://www.ubereats.com/store/crack-taco-shop-mission-valley/bulDXzA9SAKBZf9Z5Rir9g",
    postmates:
      "https://postmates.com/store/crack-taco-shop-mission-valley/bulDXzA9SAKBZf9Z5Rir9g",
  },
  {
    slug: "seaport-village",
    name: "Seaport Village",
    phone: "619-326-8497",
    placeId: "ChIJWYOhoqtT2YARcTSgOwe_gVs",
    googleMapsUrl:
      "https://www.google.com/maps/place/Crack+Taco+Shop/@32.7085273,-117.1689383,21z/data=!3m1!5s0x80d953541538a3ef:0xcb60680ac3720050!4m15!1m8!3m7!1s0x80d9535414d6782b:0x458284c75494e59d!2sA,+817+W+Harbor+Dr,+San+Diego,+CA+92101!3b1!8m2!3d32.7087013!4d-117.168991!16s%2Fg%2F11bw3zpnrf!3m5!1s0x80d953aba2a18359:0x5b81bf073ba03471!8m2!3d32.7086205!4d-117.1689692!16s%2Fg%2F11k598gzn_?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
    latitude: 32.7086205,
    longitude: -117.1689692,
    city: "San Diego",
    state: "CA",
    postalCode: "92101",
    streetAddress: "817 W. Harbor Dr., Suite D",
    seoTitle: "Tacos in Seaport Village, San Diego | Prime Taco Shop",
    description: "Visit Prime Taco Shop in Seaport Village on San Diego's waterfront. Explore tacos and burritos, order pickup, get directions or call to confirm hours.",
    introduction: "Find Prime Taco Shop at Seaport Village on the San Diego waterfront. Planning a visit to the San Diego Convention Center? Browse this shop's menu and directions, and call to confirm hours before making your dining plans.",
    menuHighlights: ["Tri-tip tacos", "Tri-tip burritos", "Tri-tip quesadillas", "Rolled tacos"],
    image: "/images/seaport-village.jpg",
    menuUrl: "/menu/seaport-village/embed",
    toastUrl:
      "https://order.toasttab.com/online/crack-taco-seaport-village-849-w-harbor-dr-c5-d",
    doorDash: "https://www.doordash.com/store/crack-taco-seaport-san-diego-26279990/74477548/",
    grubHub: "https://www.grubhub.com/restaurant/crack-taco-shop-817-w-harbor-dr-san-diego/11891120",
    uberEats:
      "https://www.ubereats.com/store/crack-taco-825-w-harbro-dr/Eq2QTROuVKi3FxULAsWUyg",
  },
  {
    slug: "encinitas",
    name: "Encinitas",
    phone: "760-230-1649",
    placeId: "ChIJ4WUU9PAM3IARnFYuDOtAOMU",
    googleMapsUrl:
      "https://www.google.com/maps/place/Crack+Taco+Shop/@33.0650804,-117.3039755,17z/data=!3m1!4b1!4m6!3m5!1s0x80dc0d68f63d1b5b:0x98ad51ab4987966c!8m2!3d33.0650759!4d-117.3014006!16s%2Fg%2F11mkpm488k?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
    latitude: 33.0650759,
    longitude: -117.3014006,
    city: "Encinitas",
    state: "CA",
    postalCode: "92024",
    // Street number is unresolved (106 vs 110); retain provider URLs and place ID.
    openingHours: { opens: "08:00", closes: "23:00" },
    seoTitle: "Tacos & Burritos in Encinitas | Prime Taco Shop",
    description: "Explore tri-tip tacos, burritos and breakfast at Prime Taco Shop in Leucadia, Encinitas. View the menu, order pickup or call to plan your visit.",
    introduction: "Explore Prime Taco Shop in Leucadia, Encinitas, for tri-tip tacos and burritos. Breakfast burritos and chilaquiles are also on this location's menu. Call the shop to confirm the street address before visiting, and check Toast for current availability.",
    menuHighlights: ["Tri-tip tacos", "Tri-tip burritos", "Tri-tip breakfast burritos", "Chilaquiles"],
    image: "/images/encinitas.jpg",
    menuUrl: "/menu/encinitas/embed",
    toastUrl:
      "https://order.toasttab.com/online/crack-taco-encinitas-110-leucadia-boulevard",
    doorDash:
      "https://www.doordash.com/store/crack-taco-shop-encinitas-37348759/86793947/",
    grubHub:
      "https://www.grubhub.com/restaurant/crack-taco-shop-106-leucadia-boulevard-encinitas/13161768",
    uberEats:
      "https://www.ubereats.com/store/crack-taco-110-leucadia-boulevard/hrnTa-8AV2aDKdkuyPJqhw",
  },
  {
    slug: "coronado",
    name: "Coronado",
    phone: "619-673-8887",
    placeId: "ChIJuTXkXsms3oARqq28AQBC5ps",
    googleMapsUrl:
      "https://www.google.com/maps/place/Crack+Taco+Shop/@32.6853843,-117.182205,17z/data=!3m1!4b1!4m6!3m5!1s0x80deadd760d8e6e7:0xd5466edb4e0a9dcd!8m2!3d32.6853798!4d-117.1796301!16s%2Fg%2F11msppcpx3?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
    latitude: 32.6853798,
    longitude: -117.1796301,
    city: "Coronado",
    state: "CA",
    postalCode: "92118",
    streetAddress: "1009 Orange Ave.",
    openingHours: { opens: "08:00", closes: "02:00" },
    seoTitle: "Late-Night Tacos in Coronado | Prime Taco Shop",
    description: "Find late-night tacos and burritos at Prime Taco Shop on Orange Avenue in Coronado, open daily until 2 a.m. View the menu, call or get directions.",
    introduction: "Visit Prime Taco Shop on Orange Avenue in Coronado for tacos and burritos. The shop stays open until 2 a.m. every night. Check the ordering menu for pickup availability; storefront hours and ordering hours can differ.",
    menuHighlights: ["Tri-tip tacos", "Tri-tip burritos", "Al pastor tacos", "Bean and cheese burritos"],
    image: "/images/coronado.jpg",
    menuUrl: "/menu/coronado/embed",
    toastUrl:
      "https://order.toasttab.com/online/crack-taco-coronado-1009-orange-avenue",
    doorDash:
      "https://www.doordash.com/store/crack-taco-shop-coronado-37348553/",
    grubHub:
      "https://www.grubhub.com/restaurant/crack-taco-shop-1009-orange-avenue-coronado/13645136",
    uberEats:
      "https://www.ubereats.com/store/crack-taco-1009-orange-avenue/VdXVkHQcWt2mQeIAYirS-Q",
    postmates:
      "https://postmates.com/store/crack-taco-1009-orange-avenue/VdXVkHQcWt2mQeIAYirS-Q",
  },
];

function formatHour(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  if (hour === 0 && minute === 0) return "Midnight";
  const minutes = minute === 0 ? "" : `:${String(minute).padStart(2, "0")}`;
  return `${hour % 12 || 12}${minutes}${hour < 12 ? "AM" : "PM"}`;
}

export const locations: Location[] = locationDetails.map((location) => ({
  ...location,
  address: location.streetAddress
    ? `${location.streetAddress}, ${location.city}, ${location.state} ${location.postalCode}`
    : `${location.city}, ${location.state} ${location.postalCode} — call to confirm street address`,
  hours: location.openingHours
    ? `Daily: ${formatHour(location.openingHours.opens)} - ${formatHour(location.openingHours.closes)}`
    : "Hours: call to confirm",
}));
