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
    placeId: "ChIJOc3z-bdV2YARQp5C72Q2NDI",
    googleMapsUrl:
      "https://www.google.com/maps/place/Crack+Taco+Shop/@32.7802181,-117.1035112,21z/data=!4m15!1m8!3m7!1s0x80d955b7f9f3cd39:0x32343664ef429e42!2s4242+Camino+Del+Rio+N,+San+Diego,+CA+92108!3b1!8m2!3d32.78!4d-117.1041249!16s%2Fg%2F11bw3x37pm!3m5!1s0x80d9554c45546781:0x669da21529a05b35!8m2!3d32.7802336!4d-117.103017!16s%2Fg%2F11fll1p4nm?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
    latitude: 32.777,
    longitude: -117.157,
    city: "San Diego",
    state: "CA",
    postalCode: "92108",
    address: "4242 Camino Del Rio N, San Diego, CA 92108",
    hours: "Daily: 7AM - Midnight",
    image: "/images/mission.jpg",
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
    placeId: "ChIJK3jWFFRT2YARneWUVMeEgkU",
    googleMapsUrl:
      "https://www.google.com/maps/place/Crack+Taco+Shop/@32.7085273,-117.1689383,21z/data=!3m1!5s0x80d953541538a3ef:0xcb60680ac3720050!4m15!1m8!3m7!1s0x80d9535414d6782b:0x458284c75494e59d!2sA,+817+W+Harbor+Dr,+San+Diego,+CA+92101!3b1!8m2!3d32.7087013!4d-117.168991!16s%2Fg%2F11bw3zpnrf!3m5!1s0x80d953aba2a18359:0x5b81bf073ba03471!8m2!3d32.7086205!4d-117.1689692!16s%2Fg%2F11k598gzn_?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
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
    placeId: "ChIJ4WUU9PAM3IARnFYuDOtAOMU",
    googleMapsUrl:
      "https://www.google.com/maps/place/Crack+Taco+Shop/@33.0650804,-117.3039755,17z/data=!3m1!4b1!4m6!3m5!1s0x80dc0d68f63d1b5b:0x98ad51ab4987966c!8m2!3d33.0650759!4d-117.3014006!16s%2Fg%2F11mkpm488k?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
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
    placeId: "ChIJuTXkXsms3oARqq28AQBC5ps",
    googleMapsUrl:
      "https://www.google.com/maps/place/Crack+Taco+Shop/@32.6853843,-117.182205,17z/data=!3m1!4b1!4m6!3m5!1s0x80deadd760d8e6e7:0xd5466edb4e0a9dcd!8m2!3d32.6853798!4d-117.1796301!16s%2Fg%2F11msppcpx3?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
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
