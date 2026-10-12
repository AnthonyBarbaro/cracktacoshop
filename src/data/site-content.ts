export const site = {
  name: "Prime Tacos",
  shortName: "Prime Tacos",
  url: "https://cracktacoshop.com",
  phone: "619-269-2828",
  instagram: "https://www.instagram.com/cracktacoshopsd",
  facebook: "https://www.facebook.com/cracktacoshop/",
  tagline: "Home of the tri-tip taco.",
  heroHeadline: "Big flavor. Prime tacos.",
  story:
    "Burgundy pepper tri-tip, handmade corn tortillas, and fresh salsa. Find your favorite tacos and burritos at Prime Tacos in San Diego.",
};

export const highlights = [
  {
    title: "Unrivaled Quality",
    description: "We only use top-quality ingredients.",
  },
  {
    title: "Flat Out Fresh",
    description: "Daily handmade tortillas, guacamole and salsa.",
  },
  {
    title: "Open Late 7 Days",
    description: "Delicious eats, morning, noon and night.",
  },
];

export const signatureDishes = [
  {
    name: "Quesadillas",
    src: "/images/beef-quesadilla.jpg",
    alt: "Quesadilla wedges served with guacamole and crema",
    description: "Golden tortillas, melted cheese, and your favorite filling.",
  },
  {
    name: "Al pastor tacos",
    src: "/images/al-pastor-street-tacos.jpg",
    alt: "Al pastor taco with pineapple, guacamole, onion, and lime",
    description: "Al pastor, pineapple, and guacamole on a handmade tortilla.",
  },
  {
    name: "Breakfast burritos",
    src: "/images/legacy/breakfast-burrito.jpg",
    alt: "Breakfast burrito halves filled with eggs and meat",
    description: "A little Prime to start your day.",
  },
];

const locationFoodPhotos: Record<string, { src: string; alt: string }> = {
  "mission-valley": { src: "/images/food-1.jpg", alt: "Taco served with three house salsas" },
  "seaport-village": { src: "/images/al-pastor-street-tacos.jpg", alt: "Al pastor taco with pineapple, guacamole, onion, and lime" },
  encinitas: { src: "/images/beef-quesadilla.jpg", alt: "Quesadilla wedges served with guacamole and crema" },
  coronado: { src: "/images/legacy/breakfast-burrito.jpg", alt: "Breakfast burrito halves filled with eggs and meat" },
};

export function getLocationFoodPhoto(slug: string): { src: string; alt: string } {
  return locationFoodPhotos[slug] ?? locationFoodPhotos["mission-valley"];
}

export const foodShowcase = [
  {
    src: "/images/food-1.jpg",
    alt: "Taco served with three house salsas",
    label: "Tri-Tip Tacos",
  },
  {
    src: "/images/food-2.jpg",
    alt: "Nachos with beef, guacamole, jalapeños, and melted cheese",
    label: "Loaded Nachos",
  },
  {
    src: "/images/food-3.jpg",
    alt: "Three tacos with guacamole, onion, and cilantro",
    label: "Handmade Tacos",
  },
  {
    src: "/images/food-5.jpg",
    alt: "Three bowls with fresh toppings",
    label: "Fresh Bowls",
  },
  {
    src: "/images/food-6.jpg",
    alt: "Three tacos served beside a drink",
    label: "Tacos & Sides",
  },
  {
    src: "/images/al-pastor-street-tacos.jpg",
    alt: "Al pastor street taco with pineapple, guacamole, and onion",
    label: "Al Pastor Street Tacos",
  },
  {
    src: "/images/beef-quesadilla.jpg",
    alt: "Beef quesadilla served with guacamole and crema",
    label: "Beef Quesadilla",
  },
];

export const legacyFoodShowcase = [
  {
    src: "/images/legacy/veggie-nachos.png",
    alt: "Veggie nachos loaded with toppings",
    label: "Veggie Nachos",
  },
  {
    src: "/images/legacy/asada.jpg",
    alt: "Asada tacos and sides on a serving board",
    label: "Asada Special",
  },
  {
    src: "/images/legacy/baja-salad.jpg",
    alt: "Baja salad with fresh greens and toppings",
    label: "Baja Salad",
  },
  {
    src: "/images/legacy/breakfast-burrito.jpg",
    alt: "Breakfast burrito cut open with house toppings",
    label: "Breakfast Burrito",
  },
  {
    src: "/images/legacy/alpastor-fries.jpg",
    alt: "Al pastor fries topped with sauce and garnish",
    label: "Al Pastor Fries",
  },
  {
    src: "/images/legacy/elote-nachos.png",
    alt: "Elote nachos with corn and crema",
    label: "Elote Nachos",
  },
  {
    src: "/images/legacy/fruit-cup-tajin.png",
    alt: "Fruit cup with tamarindo and tajin seasoning",
    label: "Fruit Cup + Tajin",
  },
  {
    src: "/images/legacy/loaded-tri-tip.png",
    alt: "Loaded tri-tip plate with toppings",
    label: "Loaded Tri-Tip",
  },
  {
    src: "/images/legacy/pup-approved.png",
    alt: "Dog-friendly menu item and snack display",
    label: "Pup Approved",
  },
  {
    src: "/images/legacy/street-corn.png",
    alt: "Street corn served with chili and toppings",
    label: "Street Corn",
  },
];

export const reviews = [
  {
    quote:
      "I liked my experience here, and felt the food was very good and enjoyable. Spacious interior for solo diners and lunch break groups. Staff was welcoming, attentive, and warm.",
    author: "M Wong",
    reviewerStats: "Local Guide · 358 reviews · 929 photos",
    locationVisited: "Encinitas",
    timeAgo: "2 months ago",
    rating: 5,
  },
  {
    quote:
      "This is the easiest 5-star rating I’ve given in a while. Service was excellent and the food came out fast and hot.",
    author: "Justin Campbell",
    reviewerStats: "2 reviews · 1 photo",
    locationVisited: "Mission Valley",
    timeAgo: "2 months ago",
    rating: 5,
  },
  {
    quote:
      "Best food to get at any time of day.",
    author: "Sean Meer",
    reviewerStats: "Local Guide · 14 reviews · 5 photos",
    locationVisited: "Coronado",
    timeAgo: "2 months ago",
    rating: 5,
  },
  {
    quote:
      "Super fast service and the burritos are packed.",
    author: "Ariana M.",
    reviewerStats: "Local Guide · 27 reviews · 18 photos",
    locationVisited: "Mission Valley",
    timeAgo: "3 months ago",
    rating: 5,
  },
  {
    quote:
      "Late night food that actually tastes fresh. Great portions, clean shop, and staff was awesome.",
    author: "Chris L.",
    reviewerStats: "13 reviews",
    locationVisited: "Seaport Village",
    timeAgo: "1 month ago",
    rating: 5,
  },
  {
    quote:
      "Love that each location has delivery options and easy pickup. Food quality has stayed consistent.",
    author: "Natalie R.",
    reviewerStats: "21 reviews · 4 photos",
    locationVisited: "Encinitas",
    timeAgo: "4 months ago",
    rating: 5,
  },
  {
    quote:
      "The queso birria and breakfast burrito were both excellent. Easily one of our go-to spots now.",
    author: "Derek S.",
    reviewerStats: "8 reviews",
    locationVisited: "Coronado",
    timeAgo: "5 months ago",
    rating: 5,
  },
  {
    quote:
      "Ordered for a group and everything was labeled and hot. Perfect place for team lunch pickups.",
    author: "Leah P.",
    reviewerStats: "Office Lunch Organizer · 11 reviews",
    locationVisited: "Mission Valley",
    timeAgo: "2 months ago",
    rating: 5,
  },
  {
    quote:
      "Best value for quality in the area. The al pastor and tri-tip both had excellent flavor and texture.",
    author: "Jason T.",
    reviewerStats: "Weekend Regular · 16 reviews",
    locationVisited: "Seaport Village",
    timeAgo: "3 months ago",
    rating: 5,
  },
  {
    quote:
      "Tried multiple locations and the food has been consistently great. Easy online ordering and pickup every time.",
    author: "Monica G.",
    reviewerStats: "Local Customer · 9 reviews",
    locationVisited: "Encinitas",
    timeAgo: "1 month ago",
    rating: 5,
  },
];

export const marketingHighlights = [
  {
    title: "New Location Spotlight",
    message: "Visit our Encinitas location for all-day tri-tip tacos and burritos.",
    ctaLabel: "Order Encinitas",
    href: "/locations/encinitas",
  },
  {
    title: "Seaport Late-Night Eats",
    message: "Open every day until 2AM. Perfect for post-game and late-night food runs.",
    ctaLabel: "Order Seaport",
    href: "/locations/seaport-village",
  },
  {
    title: "Pickup + Delivery Ready",
    message: "Order online with Toast pickup where available, plus DoorDash, GrubHub, and Uber Eats.",
    ctaLabel: "Start Ordering",
    href: "/order-online",
  },
];

export const faqItems = [
  {
    question: "Are you a San Diego based taco shop?",
    answer:
      "Yes. Prime Tacos is San Diego based and currently serves guests in Mission Valley, Seaport Village, Encinitas, and Coronado.",
  },
  {
    question: "What makes Prime Tacos different?",
    answer:
      "Our tacos and burritos feature burgundy pepper tri-tip, handmade tortillas, and fresh salsa.",
  },
  {
    question: "How do I order online?",
    answer:
      "Choose your location first, then use Order Online to open that store's menu page. This makes sure your order goes to the right kitchen.",
  },
  {
    question: "Do all locations have the same menu?",
    answer:
      "Not always. Core favorites are available across stores, but specific items and platform availability can vary by location.",
  },
  {
    question: "What delivery apps do you support?",
    answer:
      "Delivery options include DoorDash, GrubHub, and Uber Eats where available. Some stores also support Toast pickup ordering.",
  },
  {
    question: "What are your hours?",
    answer:
      "Hours vary by location, and some stores stay open late. Check the Locations page for current store hours before you visit or order.",
  },
  {
    question: "Do you have vegetarian-friendly options?",
    answer:
      "Yes. We offer vegetarian-friendly choices, including meatless menu options and sides. Availability can vary by store.",
  },
  {
    question: "How do I get directions or contact a specific store?",
    answer:
      "Open the Locations page and select your store to view map directions, address details, and direct phone links.",
  },
];
