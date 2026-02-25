export type MenuItem = {
  name: string;
  description?: string;
  price: string;
  badge?: string;
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export type MenuSection = {
  id: string;
  title: string;
  groups: MenuGroup[];
};

export type LocationMenu = {
  sections: MenuSection[];
  nav: Array<{ sectionId: string; label: string }>;
  notes: string[];
  priceSource: "manual" | "location-menu-link";
  hasLocationSpecificPricing: boolean;
  printedMenuUrl?: string;
};

const bowlBuildDescription =
  "Served over spring mix, rice & beans and topped with cheddar cheese, Cali pico, roasted corn, and cotija cheese.";

const quesadillaSidesDescription = "Side of sour cream, guacamole, pico de gallo.";

const missionValleySections: MenuSection[] = [
  {
    id: "tacos",
    title: "Tacos",
    groups: [
      {
        title: "Meat",
        items: [
          {
            name: "Crack (Tri-Tip) Taco",
            description: "Tri-tip, onion, guacamole, cilantro",
            price: "$5.25",
            badge: "Signature",
          },
          {
            name: "Al Pastor Taco",
            description: "Onion, guacamole, cilantro",
            price: "$4.25",
          },
          {
            name: "Pollo Asada Taco",
            description: "Onion, guacamole, cilantro",
            price: "$4.25",
          },
          {
            name: "Birria Taco",
            description: "Shredded beef, onions, cilantro",
            price: "$5.15",
          },
          {
            name: "Mulitas Taco - Pork, Chicken / Beef",
            description:
              "Pork/chicken/beef, guacamole, onions, cilantro, melted cheese on fresh corn tortillas",
            price: "$7.95",
          },
          {
            name: "8 Rolled Tacos",
            description: "Cheese, guacamole & lettuce",
            price: "$13.95",
          },
          {
            name: "5 Rolled Tacos",
            description: "Cheese, guacamole & lettuce",
            price: "$10.95",
          },
          {
            name: "3 Rolled Tacos",
            description: "Cheese, guacamole & lettuce",
            price: "$8.95",
          },
        ],
      },
      {
        title: "Seafood",
        items: [
          {
            name: "IPA Battered Taco",
            description: "Cabbage, pico, chipotle",
            price: "$4.95",
          },
          {
            name: "Grilled Alaskan Fish Taco",
            description: "Cabbage, pico, chipotle",
            price: "$4.95",
          },
          {
            name: "Baja Shrimp Taco",
            description: "Cabbage, pico, chipotle",
            price: "$4.95",
          },
        ],
      },
      {
        title: "Veggie",
        items: [
          {
            name: "Potato Taco",
            description: "Lettuce, pico, cotija",
            price: "$4.25",
          },
          {
            name: "Grilled Cactus Taco",
            description: "Onion, guacamole, cilantro",
            price: "$5.15",
          },
        ],
      },
    ],
  },
  {
    id: "burritos",
    title: "Burritos",
    groups: [
      {
        title: "Meat",
        items: [
          {
            name: "Surf & Turf Burrito",
            description: "Shrimp, tri-tip, Cali pico, guacamole, rice, cheese",
            price: "$16.95",
          },
          {
            name: "Crackafornia Burrito",
            description: "Fries, guacamole, cheese, sour cream, tri-tip",
            price: "$14.95",
          },
          {
            name: "Crack (Tri-Tip) Burrito",
            description: "Guacamole, California pico",
            price: "$15.25",
          },
          {
            name: "Al Pastor (Adobado) Burrito",
            description: "Pina, guacamole, California pico",
            price: "$13.95",
          },
          {
            name: "Pollo Asada Burrito",
            description: "Guacamole, California pico",
            price: "$13.95",
          },
          {
            name: "Keto Burrito",
            description: "Tri-tip, sour cream, guacamole, California pico",
            price: "$16.45",
          },
          {
            name: "Birria Burrito",
            description: "Onion, cilantro with consomme",
            price: "$15.95",
          },
        ],
      },
      {
        title: "Seafood",
        items: [
          {
            name: "IPA Battered Fish Burrito",
            description: "Chipotle creme, cabbage, cilantro, California pico",
            price: "$15.95",
          },
          {
            name: "Grilled Alaskan Fish Burrito",
            description: "Chipotle creme, cabbage, cilantro, California pico",
            price: "$14.95",
          },
          {
            name: "Baja Shrimp Burrito",
            description: "Chipotle creme, cabbage, cilantro, California pico",
            price: "$15.95",
          },
        ],
      },
      {
        title: "Veggie",
        items: [
          {
            name: "Veggie Burrito",
            description: "Red peppers, rice, beans, cheese corn, guacamole",
            price: "$13.95",
          },
          {
            name: "Bean & Cheese Burrito",
            description: "Beans, cheddar cheese",
            price: "$8.95",
          },
        ],
      },
    ],
  },
  {
    id: "breakfast",
    title: "Breakfast",
    groups: [
      {
        title: "All Day",
        items: [
          {
            name: "Crack (Tri-Tip) & Eggs Burrito",
            description: "Eggs, potatoes, cheese",
            price: "$15.95",
          },
          {
            name: "Sausage Burrito",
            description: "Eggs, potatoes, cheese",
            price: "$14.95",
          },
          {
            name: "Bacon Burrito",
            description: "Eggs, potatoes, cheese",
            price: "$14.95",
          },
          {
            name: "Ham Burrito",
            description: "Eggs, potatoes, cheese",
            price: "$13.95",
          },
          {
            name: "Potato Burrito",
            description: "Eggs, potatoes, cheese",
            price: "$12.95",
          },
          {
            name: "Machaca Burrito",
            description: "Beef, eggs, pico",
            price: "$13.95",
          },
          {
            name: "Chorizo Burrito",
            description: "Chorizo, eggs, cheese",
            price: "$14.95",
          },
          {
            name: "Breakfast Crack (Tri-Tip) Bowl",
            description: "Eggs, potatoes, cheese",
            price: "$14.95",
          },
          {
            name: "Breakfast Sausage Bowl",
            description: "Eggs, potatoes, cheese",
            price: "$12.95",
          },
          {
            name: "Breakfast Bacon Bowl",
            description: "Eggs, potatoes, cheese",
            price: "$12.95",
          },
          {
            name: "Breakfast Potato Bowl",
            description: "Eggs, potatoes, cheese",
            price: "$12.95",
          },
        ],
      },
    ],
  },
  {
    id: "bowls",
    title: "Bowls",
    groups: [
      {
        title: "Meat",
        items: [
          {
            name: "Crack (Tri-Tip) Bowl",
            description: bowlBuildDescription,
            price: "$15.95",
          },
          {
            name: "Al Pastor Bowl",
            description: bowlBuildDescription,
            price: "$13.95",
          },
          {
            name: "Pollo Asada Bowl",
            description: bowlBuildDescription,
            price: "$13.95",
          },
        ],
      },
      {
        title: "Seafood",
        items: [
          {
            name: "Baja Shrimp Bowl",
            description: bowlBuildDescription,
            price: "$15.95",
          },
        ],
      },
      {
        title: "Veggie",
        items: [
          {
            name: "Grilled Cactus Bowl",
            description: bowlBuildDescription,
            price: "$13.95",
          },
        ],
      },
    ],
  },
  {
    id: "quesadillas",
    title: "Quesadillas",
    groups: [
      {
        title: "Favorites",
        items: [
          {
            name: "Crack (Tri-Tip) Quesadilla",
            description: quesadillaSidesDescription,
            price: "$15.45",
          },
          {
            name: "Al Pastor Quesadilla",
            description: quesadillaSidesDescription,
            price: "$14.95",
          },
          {
            name: "Queso Birria",
            description: "Guacamole, sour cream",
            price: "$15.45",
          },
          {
            name: "Pollo Asada Quesadilla",
            description: quesadillaSidesDescription,
            price: "$14.95",
          },
          {
            name: "Baja Shrimp Quesadilla",
            description: quesadillaSidesDescription,
            price: "$15.55",
          },
          {
            name: "Cheese Quesadilla",
            description: quesadillaSidesDescription,
            price: "$8.95",
          },
          {
            name: "Green Chile Grilled Quesadilla",
            description: quesadillaSidesDescription,
            price: "$10.95",
          },
        ],
      },
    ],
  },
  {
    id: "nachos-fries",
    title: "Nachos, Fries & More",
    groups: [
      {
        title: "Shareables",
        items: [
          {
            name: "Mexican Street Corn Nachos",
            description: "Nacho cheese, corn, cotija, Valentina",
            price: "$14.95",
          },
          {
            name: "Crack Tri-Tip Nachos",
            description: "Nacho & cheddar cheese, beans, chipotle cream, guacamole, jalapenos",
            price: "$16.95",
          },
          {
            name: "Crack Tri-Tip Fries",
            description: "Cardiff crack, guacamole, cheddar cheese, creme, french fries, Cali pico",
            price: "$16.95",
          },
          {
            name: "Al Pastor Fries",
            description: "Guacamole, cheese, sour cream, chipotle cream",
            price: "$16.95",
          },
          {
            name: "Pollo Asado Fries",
            description: "Guacamole, cheese, sour cream, chipotle cream",
            price: "$16.95",
          },
          {
            name: "Veggie Nachos",
            description: "Mexican corn, nacho & cheddar cheese, guacamole, Cali pico, jalapenos",
            price: "$14.95",
          },
          {
            name: "Crack (Tri-Tip) Sandwich",
            description: "Cardiff crack tri-tip, BBQ sauce, bun, served with fries",
            price: "$15.95",
          },
        ],
      },
    ],
  },
  {
    id: "salads",
    title: "Salads",
    groups: [
      {
        title: "Signature Salads",
        items: [
          {
            name: "Roast Pepper Caesar Salad",
            description: "Romaine lettuce, cheese, roasted peppers, croutons",
            price: "$13.95",
          },
          {
            name: "Chipotle Salad",
            description: "Roasted corn, lettuce, tomato, onion, cheddar cheese",
            price: "$13.95",
          },
          {
            name: "Baja Caesar Salad",
            description:
              "Romaine lettuce, Oaxaca, cheese, croutons, cilantro, roast pepper, caesar",
            price: "$12.95",
          },
          {
            name: "House Chicken Salad",
            description: "Chicken, avocado, Italian dressing, spring mix",
            price: "$16.95",
          },
        ],
      },
      {
        title: "Add Ons",
        items: [
          { name: "Add Shrimp", price: "$6.95" },
          { name: "Add Pollo", price: "$4.95" },
          { name: "Add Crack/Tri-Tip", price: "$6.95" },
          { name: "Add Al Pastor", price: "$4.95" },
        ],
      },
    ],
  },
  {
    id: "sides-desserts",
    title: "Sides & Desserts",
    groups: [
      {
        title: "Sides",
        items: [
          { name: "Chips & Guacamole", price: "$10.95" },
          { name: "French Fries", price: "$5.95" },
          { name: "Rice or Beans", price: "$4.95" },
          { name: "Hot Carrots", price: "$4.95" },
          { name: "Mexican Street Corn", price: "$5.45" },
        ],
      },
      {
        title: "Desserts",
        items: [
          { name: "2 PC Churros", price: "$5.95" },
          { name: "Dulce De Leche Cake", price: "$6.95" },
          { name: "Flan", price: "$6.95" },
        ],
      },
    ],
  },
  {
    id: "beverages",
    title: "Beverages",
    groups: [
      {
        title: "Non-Alcoholic",
        items: [
          { name: "Agua Frescas", price: "$5.15" },
          { name: "Fountain Drink", price: "$3.95" },
          { name: "Mexican Bottled Soda", price: "$3.95" },
          { name: "Spicy Lemonade or Mango Lemonade", price: "$5.95" },
          { name: "Bottled Water", price: "$2.50" },
        ],
      },
      {
        title: "21+ Beverages",
        items: [
          {
            name: "Sangria",
            description: "White or red",
            price: "$7.95",
          },
          {
            name: "Micheladas & Cheladas",
            description: "Mexican beer, chamoy, tajin, clamato juice",
            price: "$8.95",
          },
          {
            name: "Mexican or Craft Beer",
            description: "Bottle only - Tecate, Dos Equis, Corona, Pacifico",
            price: "$5.50",
          },
          {
            name: "Margaritas",
            description: "Choice of strawberry or lime",
            price: "$7.95",
          },
        ],
      },
    ],
  },
  {
    id: "kids",
    title: "Kid's Menu",
    groups: [
      {
        title: "Kid Favorites",
        items: [
          {
            name: "Kid's Nachos",
            description: "Chips, nacho cheese",
            price: "$8.45",
          },
          {
            name: "Three Cheese Quesadilla",
            price: "$8.45",
          },
          {
            name: "Bean & Cheese Burrito",
            price: "$8.45",
          },
        ],
      },
    ],
  },
];

const emptySections: MenuSection[] = [];

const missionValleyMenu: LocationMenu = {
  sections: missionValleySections,
  nav: missionValleySections.map((section) => ({ sectionId: section.id, label: section.title })),
  notes: [
    "Mission Valley pricing is maintained directly in this website menu.",
    "Prices and availability can still change by ordering provider.",
  ],
  priceSource: "manual",
  hasLocationSpecificPricing: true,
};

const locationMenus: Record<string, LocationMenu> = {
  "mission-valley": missionValleyMenu,
  "seaport-village": {
    sections: emptySections,
    nav: [],
    notes: [
      "Seaport Village has location-specific pricing.",
      "Use the attached menu link or delivery providers for the latest prices.",
    ],
    priceSource: "location-menu-link",
    hasLocationSpecificPricing: true,
    printedMenuUrl: "https://cracktacoshop.com/wp-content/uploads/2024/05/cracktaco-menu-seaport.jpg",
  },
  encinitas: {
    sections: emptySections,
    nav: [],
    notes: [
      "Encinitas has location-specific pricing.",
      "Use Toast or the attached menu image for the latest prices.",
    ],
    priceSource: "location-menu-link",
    hasLocationSpecificPricing: true,
    printedMenuUrl:
      "https://cracktacoshop.com/wp-content/uploads/2025/10/CrackTaco-Menu-Small-Front-scaled.jpg",
  },
  coronado: {
    sections: emptySections,
    nav: [],
    notes: [
      "Coronado has location-specific pricing.",
      "Use Toast or delivery partners for the latest prices.",
    ],
    priceSource: "location-menu-link",
    hasLocationSpecificPricing: true,
  },
};

export function getMenuForLocation(slug: string): LocationMenu {
  return locationMenus[slug] ?? missionValleyMenu;
}

export function getFlattenedMenuItems(sections: MenuSection[]): MenuItem[] {
  return sections.flatMap((section) => section.groups.flatMap((group) => group.items));
}
