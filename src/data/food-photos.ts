export type FoodPhoto = {
  id: string;
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  frame?: { width: number; height: number; position: string };
};

export const homeHeroPhoto: FoodPhoto = {
  id: "hero-tacos-elegant",
  src: "/images/food/hero-tacos-elegant.webp",
  alt: "Grilled beef tacos with guacamole, onion, and cilantro on a ceramic plate beside salsa and lime",
  label: "Fresh tacos",
  width: 1672,
  height: 941,
  frame: { width: 1672, height: 941, position: "75% 50%" },
};

export const foodPhotos: FoodPhoto[] = [
  {
    id: "loaded-nachos-guacamole",
    src: "/images/food/loaded-nachos-guacamole.webp",
    alt: "Loaded nachos topped with guacamole, jalapeños, cheese, and crema",
    label: "Loaded nachos",
    width: 756,
    height: 1008,
  },
  {
    id: "taco-three-salsas",
    src: "/images/food/taco-three-salsas-sage.webp",
    alt: "A taco topped with guacamole, onion, and cilantro beside three salsas on a light sage green tabletop",
    label: "Tacos and house salsas",
    width: 630,
    height: 640,
  },
  {
    id: "loaded-fries-fork",
    src: "/images/food/loaded-fries-fork.webp",
    alt: "A fork lifting loaded fries with meat, melted cheese, guacamole, and crema",
    label: "Loaded fries",
    width: 756,
    height: 1008,
  },
  {
    id: "loaded-nachos-chip",
    src: "/images/food/loaded-nachos-chip.webp",
    alt: "A tortilla chip lifting meat, cheese, guacamole, and jalapeño from loaded nachos",
    label: "Nachos with guacamole",
    width: 756,
    height: 1008,
  },
  {
    id: "takeout-spread",
    src: "/images/food/takeout-spread.webp",
    alt: "An overhead spread of takeout trays, rice, salsa, and guacamole",
    label: "Takeout favorites",
    width: 1290,
    height: 1453,
  },
  {
    id: "loaded-tostada-lime",
    src: "/images/food/loaded-tostada-lime.webp",
    alt: "A loaded crisp tortilla with salsa, shredded cabbage, and crema, with lime being squeezed above it",
    label: "Fresh from the kitchen",
    width: 1057,
    height: 1800,
  },
  {
    id: "tacos-blue-table",
    src: "/images/food/tacos-blue-table.webp",
    alt: "Tacos topped with meat, guacamole, chopped onion, and cilantro on a blue table",
    label: "Handmade tacos",
    width: 832,
    height: 1800,
    frame: { width: 1284, height: 1581, position: "50% 50%" },
  },
  {
    id: "quesadilla-cheese-pull",
    src: "/images/food/quesadilla-cheese-pull.webp",
    alt: "Hands pulling apart a cheesy quesadilla over a tray of grilled quesadilla wedges",
    label: "Quesadillas",
    width: 860,
    height: 1800,
  },
  {
    id: "patio-burrito",
    src: "/images/food/patio-burrito.webp",
    alt: "A diner holding a large foil-wrapped burrito on an outdoor patio",
    label: "Burritos on the patio",
    width: 830,
    height: 1800,
    frame: { width: 1290, height: 1550, position: "50% 74%" },
  },
];

export const featuredFoodPhotos = foodPhotos.slice(0, 3);

export const heroFoodPhotos: FoodPhoto[] = [
  "loaded-nachos-guacamole",
  "taco-three-salsas",
  "takeout-spread",
  "loaded-fries-fork",
].flatMap((id) => foodPhotos.filter((photo) => photo.id === id));
