export type Location = {
  slug: string;
  name: string;
  phone?: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  postalCode: string;
  address: string;
  hours: string;
  image: string;
  menuUrl?: string;
  toastUrl?: string;
  doorDash?: string;
  grubHub?: string;
  uberEats?: string;
};

export const locations: Location[] = [
  {
    slug: "mission-valley",
    name: "Mission Valley",
    phone: "619-269-2828",
    latitude: 32.777,
    longitude: -117.157,
    city: "San Diego",
    state: "CA",
    postalCode: "92108",
    address: "4242 Camino Del Rio N, San Diego, CA 92108",
    hours: "Daily: 7AM - Midnight",
    image: "/images/mission-valley.jpg",
    menuUrl: "/menu/mission-valley/embed",
    doorDash:
      "https://www.doordash.com/store/crack-taco-shop-san-diego-841981/44392947/",
    grubHub:
      "https://www.grubhub.com/restaurant/crack-taco-shop-4242-camino-del-rio-n-ste-28-san-diego/1397766",
    uberEats:
      "https://www.ubereats.com/store/crack-taco-shop-mission-valley/bulDXzA9SAKBZf9Z5Rir9g",
  },
  {
    slug: "seaport-village",
    name: "Seaport Village",
    phone: "619-326-8497",
    latitude: 32.7089,
    longitude: -117.1705,
    city: "San Diego",
    state: "CA",
    postalCode: "92101",
    address: "817 W. Harbor Dr, San Diego, CA 92101",
    hours: "Open Every Day 7AM-2AM",
    image: "/images/seaport-village.jpg",
    menuUrl: "/menu/seaport-village/embed",
    doorDash: "https://www.doordash.com/store/crack-taco-seaport-san-diego-26279990/74477548/",
    grubHub: "https://www.grubhub.com/restaurant/crack-taco-shop-817-w-harbor-dr-san-diego/11891120",
    uberEats:
      "https://www.ubereats.com/store/crack-taco-shop-817-west-harbor-drive/7KsFzrsEU3y4XemmvflF6g",
  },
  {
    slug: "encinitas",
    name: "Encinitas",
    phone: "760-230-1649",
    latitude: 33.0657,
    longitude: -117.2897,
    city: "Encinitas",
    state: "CA",
    postalCode: "92024",
    address: "106 Leucadia Blvd, Encinitas, CA 92024",
    hours: "Open Every Day 8AM-11PM",
    image: "/images/encinitas.jpg",
    menuUrl: "/menu/encinitas/embed",
    toastUrl:
      "https://www.toasttab.com/local/order/crack-taco-encinitas-110-leucadia-boulevard/r-5d008fa1-2fb2-4e56-8195-8dd5d1338ed7",
    doorDash:
      "https://www.doordash.com/store/crack-taco-shop-encinitas-37348759/86793947/",
    grubHub:
      "https://www.grubhub.com/restaurant/crack-taco-shop-106-leucadia-boulevard-encinitas/13161768",
  },
  {
    slug: "coronado",
    name: "Coronado",
    phone: "619-673-8887",
    latitude: 32.6926,
    longitude: -117.1785,
    city: "Coronado",
    state: "CA",
    postalCode: "92118",
    address: "1009 Orange Ave. Coronado, CA 92118",
    hours: "Open from 8AM-2AM everyday",
    image: "/images/coronado.jpg",
    menuUrl: "/menu/coronado/embed",
    toastUrl:
      "https://www.toasttab.com/local/order/crack-taco-coronado-1009-orange-avenue/r-67bc00f3-085b-42d4-a68e-33cf00d9485c",
  },
];
