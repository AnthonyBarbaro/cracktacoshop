export type MenuItem = {
  name: string;
  description?: string;
  price: string;
  priceOptions?: Array<{ label: string; price: string }>;
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
  priceSource: "manual" | "printed-menu" | "location-menu-link";
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
            name: "Prime (Tri-Tip) Taco",
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
            name: "California Burrito",
            description: "Fries, guacamole, cheese, sour cream, tri-tip",
            price: "$14.95",
          },
          {
            name: "Prime (Tri-Tip) Burrito",
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
            name: "Prime (Tri-Tip) & Eggs Burrito",
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
            name: "Breakfast Prime (Tri-Tip) Bowl",
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
            name: "Prime (Tri-Tip) Bowl",
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
            name: "Prime (Tri-Tip) Quesadilla",
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
            name: "Prime Tri-Tip Nachos",
            description: "Nacho & cheddar cheese, beans, chipotle cream, guacamole, jalapenos",
            price: "$16.95",
          },
          {
            name: "Prime Tri-Tip Fries",
            description: "Burgundy pepper tri-tip, guacamole, cheddar cheese, creme, french fries, Cali pico",
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
            name: "Prime (Tri-Tip) Sandwich",
            description: "Burgundy pepper tri-tip, BBQ sauce, bun, served with fries",
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
          { name: "Add Prime/Tri-Tip", price: "$6.95" },
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

function tacoPrices(single: string, pair: string): Array<{ label: string; price: string }> {
  return [{ label: "1 taco", price: single }, { label: "2 tacos", price: pair }];
}

// Transcribed from the printed menu linked by the official Seaport Village page.
const seaportVillageSections: MenuSection[] = [
  {
    id: "tacos", title: "Tacos", groups: [
      { title: "Meat", items: [
        { name: "Tri-Tip Taco", description: "Onion, guacamole, cilantro", price: "$6.95", priceOptions: tacoPrices("$6.95", "$12.95"), badge: "Signature" },
        { name: "Al Pastor Taco", description: "Onion, cilantro, guacamole", price: "$6.95", priceOptions: tacoPrices("$6.95", "$12.95") },
        { name: "Pollo Asada Taco", description: "Onion, cilantro, guacamole", price: "$5.95", priceOptions: tacoPrices("$5.95", "$11.50") },
      ] },
      { title: "Seafood", items: [
        { name: "Baja Shrimp Taco", description: "Cabbage, pico, chipotle", price: "$6.95", priceOptions: tacoPrices("$6.95", "$12.95") },
        { name: "Battered Fish Taco", description: "Cabbage, pico, chipotle", price: "$5.95", priceOptions: tacoPrices("$5.95", "$11.50") },
        { name: "Grilled Fish Taco", description: "Cabbage, pico, chipotle", price: "$5.95", priceOptions: tacoPrices("$5.95", "$11.50") },
      ] },
      { title: "Vegetarian", items: [
        { name: "Potato Taco", description: "Cabbage, pico, cotija cheese", price: "$5.95", priceOptions: tacoPrices("$5.95", "$11.50") },
      ] },
    ],
  },
  {
    id: "burritos", title: "Burritos", groups: [
      { title: "Meat & seafood", items: [
        { name: "Tri-Tip Burrito", description: "Guacamole, pico", price: "$18.95" },
        { name: "Al Pastor Burrito", description: "Pineapple, guacamole, pico", price: "$17.95" },
        { name: "Pollo Asado Burrito", description: "Guacamole, pico", price: "$17.95" },
        { name: "Baja Shrimp Burrito", description: "Rice, cabbage, pico, chipotle aioli", price: "$18.95" },
        { name: "California Burrito", description: "Fries, guacamole, cheese, sour cream, tri-tip", price: "$18.95" },
      ] },
      { title: "Vegetarian", items: [
        { name: "Veggie Burrito", description: "Rice, beans, lettuce, pico, guacamole", price: "$15.95" },
        { name: "Bean & Cheese Burrito", description: "Beans, cheddar cheese", price: "$11.95" },
      ] },
    ],
  },
  {
    id: "breakfast", title: "Breakfast", groups: [
      { title: "Burritos", items: [
        { name: "Tri-Tip Breakfast Burrito", description: "Eggs, potatoes, cheese", price: "$18.95" },
        { name: "Sausage Burrito", description: "Eggs, potatoes, cheese", price: "$16.95" },
        { name: "Bacon Burrito", description: "Eggs, potatoes, cheese", price: "$16.95" },
        { name: "Ham Burrito", description: "Eggs, potatoes, cheese", price: "$16.95" },
        { name: "Potato Burrito", description: "Eggs, potatoes, cheese", price: "$15.95" },
      ] },
      { title: "Chilaquiles", items: [
        { name: "Chilaquiles", description: "Red or green salsa, served with two eggs", price: "$16.95" },
        { name: "Add chicken, tri-tip, or al pastor", price: "$5.00" },
      ] },
    ],
  },
  {
    id: "quesadillas", title: "Quesadillas", groups: [
      { title: "Served with sour cream & guacamole", items: [
        { name: "Tri-Tip Quesadilla", price: "$17.95" },
        { name: "Al Pastor Quesadilla", price: "$16.95" },
        { name: "Pollo Asado Quesadilla", price: "$16.95" },
        { name: "Shrimp Quesadilla", price: "$17.95" },
      ] },
    ],
  },
  {
    id: "rolled-tacos", title: "Rolled tacos", groups: [
      { title: "Beef or chicken", items: [
        { name: "3 Rolled Tacos", description: "Guacamole, pico, lettuce, cheese", price: "$9.95" },
        { name: "6 Rolled Tacos", description: "Guacamole, pico, lettuce, cheese", price: "$16.95" },
      ] },
    ],
  },
  {
    id: "specials", title: "Specials", groups: [
      { title: "Nachos, fries & more", items: [
        { name: "Tri-Tip Nachos", price: "$17.95" },
        { name: "Tri-Tip French Fries", price: "$17.95" },
        { name: "Chicken Nachos", price: "$16.95" },
        { name: "Chicken Fries", price: "$16.95" },
        { name: "Fish & Chips", price: "$19.95" },
      ] },
    ],
  },
  {
    id: "sides-desserts", title: "Sides & desserts", groups: [
      { title: "Sides", items: [
        { name: "Mexican Street Corn", price: "$6.95" },
        { name: "Side of Rice", price: "$6.95" },
        { name: "Side of Beans", price: "$6.95" },
        { name: "French Fries", price: "$5.95" },
        { name: "Chips & Guacamole", price: "$13.95" },
      ] },
      { title: "Dessert", items: [
        { name: "2 Churros", price: "$9.95" },
      ] },
    ],
  },
];

// Transcribed from the printed menu linked by the official Encinitas page.
const encinitasSections: MenuSection[] = [
  {
    id: "tacos", title: "Tacos", groups: [
      { title: "Meat", items: [
        { name: "Tri-Tip Taco", price: "$6.75", priceOptions: tacoPrices("$6.75", "$12.00"), badge: "Signature" },
        { name: "Pollo Asada Taco", price: "$5.95", priceOptions: tacoPrices("$5.95", "$11.00") },
        { name: "Al Pastor Taco", price: "$6.95", priceOptions: tacoPrices("$6.95", "$12.00") },
        { name: "Birria Taco", price: "$6.95", priceOptions: tacoPrices("$6.95", "$12.00") },
      ] },
      { title: "Seafood", items: [
        { name: "Baja Shrimp Taco", price: "$6.95", priceOptions: tacoPrices("$6.95", "$12.00") },
        { name: "Battered Fish Taco", price: "$6.95", priceOptions: tacoPrices("$6.95", "$12.00") },
        { name: "Grilled Fish Taco", price: "$6.95", priceOptions: tacoPrices("$6.95", "$12.00") },
      ] },
      { title: "Vegetarian", items: [
        { name: "Potato Taco", price: "$5.95", priceOptions: tacoPrices("$5.95", "$11.00") },
      ] },
    ],
  },
  {
    id: "burritos", title: "Burritos", groups: [
      { title: "Meat & seafood", items: [
        { name: "Tri-Tip Burrito", description: "Tri-tip, guacamole, pico", price: "$17.95" },
        { name: "Al Pastor Burrito", description: "Al pastor, guacamole, pico", price: "$15.95" },
        { name: "Pollo Asada Burrito", description: "Pollo asada, guacamole, pico", price: "$15.95" },
        { name: "California Burrito", description: "Tri-tip, fries, guacamole, sour cream, cheese", price: "$17.95" },
        { name: "Surf & Turf Burrito", description: "Tri-tip, shrimp, cabbage, chipotle aioli, pico", price: "$18.95" },
        { name: "Baja Shrimp Burrito", description: "Shrimp, rice, chipotle aioli, cabbage, pico", price: "$17.95" },
      ] },
      { title: "Vegetarian", items: [
        { name: "Veggie Burrito", description: "Rice, beans, lettuce, pico, guacamole", price: "$14.95" },
        { name: "Bean & Cheese Burrito", description: "Beans, cheddar cheese", price: "$10.95" },
      ] },
    ],
  },
  {
    id: "breakfast", title: "Breakfast", groups: [
      { title: "Burritos", items: [
        { name: "Tri-Tip Breakfast Burrito", description: "Tri-tip, eggs, potatoes, cheese", price: "$16.95" },
        { name: "Sausage Burrito", description: "Sausage, eggs, potatoes, cheese", price: "$15.95" },
        { name: "Bacon Burrito", description: "Bacon, eggs, potatoes, cheese", price: "$15.95" },
        { name: "Ham Burrito", description: "Ham, eggs, potatoes, cheese", price: "$15.95" },
        { name: "Chorizo Burrito", description: "Chorizo, eggs, potatoes, cheese", price: "$15.95" },
        { name: "Potato Burrito", description: "Eggs, potatoes, cheese", price: "$13.95" },
      ] },
      { title: "Chilaquiles", items: [
        { name: "Chilaquiles", description: "Red or green sauce", price: "$12.95" },
        { name: "Add tri-tip, chicken, or al pastor", price: "$5.00" },
      ] },
    ],
  },
  {
    id: "quesadillas", title: "Quesadillas", groups: [
      { title: "Served with sour cream & guacamole", items: [
        { name: "Tri-Tip Quesadilla", price: "$15.95" },
        { name: "Pollo Asada Quesadilla", price: "$14.95" },
        { name: "Al Pastor Quesadilla", price: "$14.95" },
        { name: "Baja Shrimp Quesadilla", price: "$15.95" },
        { name: "Cheese Quesadilla", price: "$9.95" },
        { name: "Birria Quesadilla", price: "$15.95" },
      ] },
    ],
  },
  {
    id: "rolled-tacos", title: "Rolled tacos", groups: [
      { title: "Chicken or beef", items: [
        { name: "3 Rolled Tacos", description: "Lettuce, guacamole, cheese", price: "$9.95" },
        { name: "5 Rolled Tacos", description: "Lettuce, guacamole, cheese", price: "$14.95" },
      ] },
    ],
  },
  {
    id: "specials", title: "Specials", groups: [
      { title: "Nachos & fries", items: [
        { name: "Tri-Tip Nachos", price: "$16.95" },
        { name: "Pollo Asado Nachos", price: "$15.95" },
        { name: "Al Pastor Nachos", price: "$16.95" },
        { name: "Tri-Tip Fries", price: "$16.95" },
        { name: "Pollo Asado Fries", price: "$15.95" },
        { name: "Al Pastor Fries", price: "$14.95" },
        { name: "Fish & Chips", price: "$19.95" },
      ] },
    ],
  },
  {
    id: "sides-desserts", title: "Sides & desserts", groups: [
      { title: "Sides", items: [
        { name: "Chips & Guacamole", price: "$11.95" },
        { name: "Chips & Salsa", price: "$7.95" },
        { name: "Side of Rice", price: "$5.95" },
        { name: "Side of Beans", price: "$5.95" },
        { name: "French Fries", price: "$6.95" },
        { name: "Hot Carrots", description: "With jalapeños", price: "$4.95" },
        { name: "Mexican Street Corn", price: "$6.95" },
      ] },
      { title: "Dessert", items: [
        { name: "2 Churros", price: "$6.95" },
      ] },
    ],
  },
  {
    id: "beverages", title: "Drinks", groups: [
      { title: "Beverages", items: [
        { name: "Fountain Drink", price: "$3.95" },
        { name: "Bottled Water", description: "20 oz.", price: "$2.95" },
        { name: "Agua Frescas", price: "$4.95" },
        { name: "Jarritos", price: "$4.95" },
        { name: "Topo Chico", price: "$4.95" },
      ] },
    ],
  },
];

const unavailableMenu: LocationMenu = {
  sections: [],
  nav: [],
  notes: ["Choose a location to browse its menu."],
  priceSource: "location-menu-link",
  hasLocationSpecificPricing: false,
};

const missionValleyMenu: LocationMenu = {
  sections: missionValleySections,
  nav: missionValleySections.map((section) => ({ sectionId: section.id, label: section.title })),
  notes: [
    "These prices apply to Mission Valley.",
    "Prices and availability can still change by ordering provider.",
  ],
  priceSource: "manual",
  hasLocationSpecificPricing: true,
};

const locationMenus: Record<string, LocationMenu> = {
  "mission-valley": missionValleyMenu,
  "seaport-village": {
    sections: seaportVillageSections,
    nav: seaportVillageSections.map((section) => ({ sectionId: section.id, label: section.title })),
    notes: [
      "Items and prices are transcribed from the printed menu linked by Seaport Village.",
      "Printed prices are a reference. Confirm current prices and availability when ordering.",
    ],
    priceSource: "printed-menu",
    hasLocationSpecificPricing: true,
    printedMenuUrl: "https://cracktacoshop.com/wp-content/uploads/2024/05/cracktaco-menu-seaport.jpg",
  },
  encinitas: {
    sections: encinitasSections,
    nav: encinitasSections.map((section) => ({ sectionId: section.id, label: section.title })),
    notes: [
      "Items and prices are transcribed from the printed menu linked by Encinitas.",
      "Printed prices are a reference. Confirm current prices and availability when ordering.",
    ],
    priceSource: "printed-menu",
    hasLocationSpecificPricing: true,
    printedMenuUrl:
      "https://cracktacoshop.com/wp-content/uploads/2025/10/CrackTaco-Menu-Small-Front-scaled.jpg",
  },
  coronado: {
    sections: [],
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
  return Object.prototype.hasOwnProperty.call(locationMenus, slug) ? locationMenus[slug] : unavailableMenu;
}

export function getFlattenedMenuItems(sections: MenuSection[]): MenuItem[] {
  return sections.flatMap((section) => section.groups.flatMap((group) => group.items));
}
