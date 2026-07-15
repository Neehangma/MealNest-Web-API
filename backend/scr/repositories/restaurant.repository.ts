const Restaurant = require("../models/restaurant.model");
const { parsePagination } = require("../utils/apihelper.utils");

const PRICE_OPTIONS = [150, 180, 200, 220, 250, 275, 300, 325, 350, 375, 400, 420, 450, 475, 500];
const RESTAURANT_PRICES = {
  Amour: 450, Antica: 400, Bella: 350, Bhanchha: 220, Chulo: 250,
  Golden: 420, "Hankook Sarang": 375, "Kimchi House": 275,
  "La Bella Italia": 350, "La Vie": 475, Napoli: 300, Osaka: 420,
  Roja: 200, Roma: 325, "Sakura Omakase": 500, "Sakura Restaurant": 325,
  Sarang: 275, Sensa: 450, "Seoul Kitchen": 300,
  "The Golden Truffle": 500, "The Mahal": 375, "The Spice Route": 250,
  Patio: 320, Trials: 450, Trattoria: 350, Sapori: 450, Tavola: 325,
  Nami: 450, Ken: 300, Tokyo: 475, Tian: 325, San: 275,
  Mitra: 450, Chatori: 300, Rasoi: 275, Filili: 475, Parth: 325, Tales: 400,
  "Dim Sum Delight": 300, Mandarin: 450, Jade: 275, "Dragon Wok": 325,
  "Lotus Garden": 425, "Red Lantern": 250, "Red Pavilion": 500,
  "Tichuca Rooftop Bar": 475, "Sabai Di Mai": 300, Siam: 450, Tanrak: 275,
};

const NEW_RESTAURANTS = [
  {
    name: "Patio",
    cuisine: "Mediterranean",
    location: "Lazimpat",
    description: "A relaxed Mediterranean dining room serving bright seasonal plates and wood-fired favorites.",
    rating: 4.6,
    reviewCount: 86,
    image: "/images/Patio.jpg",
    price: 320,
    isActive: true,
    isOpen: true,
    address: "Lazimpat Road, Kathmandu",
    phone: "+977 1-4422100",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:30 AM", "1:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Mediterranean Menu", "Private Dining", "Seasonal Plates"],
  },
  {
    name: "Trials",
    cuisine: "Nepali",
    location: "Jhamsikhel",
    description: "Contemporary Nepali cuisine presented in an intimate modern setting with locally sourced ingredients.",
    rating: 4.8,
    reviewCount: 112,
    image: "/images/Trials.jpg",
    price: 450,
    isActive: true,
    isOpen: true,
    address: "Jhamsikhel, Lalitpur",
    phone: "+977 1-5423100",
    hours: "Tue-Sun: 12:00 PM - 10:30 PM",
    featured: true,
    availableTimeSlots: ["12:00 PM", "2:00 PM", "6:00 PM", "7:30 PM", "9:00 PM"],
    features: ["Local Ingredients", "Chef Tasting Menu", "Reservations"],
  },
  {
    name: "Trattoria",
    cuisine: "Italian",
    location: "Kathmandu",
    description: "A cosy Italian trattoria serving handmade pasta, wood-fired pizza, risotto, and traditional regional dishes.",
    rating: 4.7,
    reviewCount: 96,
    image: "/images/Trattoria.jpg",
    priceRange: "$$",
    price: 350,
    isActive: true,
    isOpen: true,
    address: "Thamel, Kathmandu, Nepal",
    phone: "+977 1-4701122",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Handmade Pasta", "Wood-Fired Pizza", "Risotto", "Family Friendly"],
  },
  {
    name: "Sapori",
    cuisine: "Italian",
    location: "Lalitpur",
    description: "A modern Italian restaurant offering fresh pasta, artisan pizza, seafood, and elegant Italian dining.",
    rating: 4.8,
    reviewCount: 108,
    image: "/images/sapori.jpg",
    priceRange: "$$$",
    price: 450,
    isActive: true,
    isOpen: true,
    address: "Jhamsikhel, Lalitpur, Nepal",
    phone: "+977 1-5422188",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Fresh Pasta", "Artisan Pizza", "Seafood", "Elegant Dining"],
  },
  {
    name: "Tavola",
    cuisine: "Italian",
    location: "Kathmandu",
    description: "A welcoming Italian restaurant known for pasta, pizza, antipasti, and relaxed family-style dining.",
    rating: 4.6,
    reviewCount: 84,
    image: "/images/tavola.jpg",
    priceRange: "$$",
    price: 325,
    isActive: true,
    isOpen: true,
    address: "Lazimpat, Kathmandu, Nepal",
    phone: "+977 1-4423190",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Pasta", "Pizza", "Antipasti", "Family Friendly"],
  },
  {
    name: "Nami",
    cuisine: "Japanese",
    location: "Kathmandu",
    description: "A modern Japanese restaurant serving sushi, sashimi, ramen, tempura, and carefully prepared seasonal dishes.",
    rating: 4.8,
    reviewCount: 124,
    image: "/images/nami.jpg",
    priceRange: "$$$",
    price: 450,
    isActive: true,
    isOpen: true,
    address: "Durbar Marg, Kathmandu, Nepal",
    phone: "+977 1-4223188",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Salmon Sushi", "Sashimi", "Chicken Ramen", "Vegetable Tempura"],
  },
  {
    name: "Ken",
    cuisine: "Japanese",
    location: "Lalitpur",
    description: "A relaxed Japanese dining space known for ramen, rice bowls, gyoza, sushi rolls, and traditional comfort food.",
    rating: 4.6,
    reviewCount: 91,
    image: "/images/ken.jpg",
    priceRange: "$$",
    price: 300,
    isActive: true,
    isOpen: true,
    address: "Jhamsikhel, Lalitpur, Nepal",
    phone: "+977 1-5424075",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Chicken Ramen", "Chicken Gyoza", "Sushi Rolls", "Teriyaki Donburi"],
  },
  {
    name: "Tokyo",
    cuisine: "Japanese",
    location: "Kathmandu",
    description: "A premium Japanese restaurant offering sushi platters, sashimi, teppanyaki, ramen, and elegant contemporary dining.",
    rating: 4.9,
    reviewCount: 147,
    image: "/images/tokyo.jpg",
    priceRange: "$$$",
    price: 475,
    isActive: true,
    isOpen: true,
    address: "Lazimpat, Kathmandu, Nepal",
    phone: "+977 1-4425099",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Sushi Platter", "Sashimi", "Teppanyaki", "Chicken Ramen"],
  },
  {
    name: "Tian",
    cuisine: "Japanese",
    location: "Bhaktapur",
    description: "A welcoming Japanese restaurant serving fresh sushi, udon, donburi, tempura, and grilled specialities.",
    rating: 4.7,
    reviewCount: 102,
    image: "/images/Tian.jpg",
    priceRange: "$$",
    price: 325,
    isActive: true,
    isOpen: true,
    address: "Suryabinayak, Bhaktapur, Nepal",
    phone: "+977 1-6612840",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Salmon Sushi", "Udon", "Teriyaki Donburi", "Vegetable Tempura"],
  },
  {
    name: "San",
    cuisine: "Japanese",
    location: "Kathmandu",
    description: "A cosy Japanese restaurant featuring ramen, sushi rolls, bento meals, yakitori, and family-friendly dining.",
    rating: 4.5,
    reviewCount: 78,
    image: "/images/san.jpg",
    priceRange: "$$",
    price: 275,
    isActive: true,
    isOpen: true,
    address: "Boudha, Kathmandu, Nepal",
    phone: "+977 1-4913076",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Chicken Ramen", "Sushi Rolls", "Bento Meals", "Yakitori"],
  },
  {
    name: "Mitra",
    cuisine: "Indian",
    location: "Kathmandu",
    description: "A premium Indian restaurant serving authentic North Indian curries, tandoori dishes, biryani, naan, and vegetarian specialties.",
    rating: 4.8,
    reviewCount: 132,
    image: "/images/Mitra.jpg",
    priceRange: "$$$",
    price: 450,
    isActive: true,
    isOpen: true,
    address: "Durbar Marg, Kathmandu, Nepal",
    phone: "+977 1-4225168",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Butter Chicken", "Hyderabadi Biryani", "Tandoori Chicken", "Garlic Naan"],
  },
  {
    name: "Chatori",
    cuisine: "Indian",
    location: "Lalitpur",
    description: "A lively Indian restaurant offering street food, chaat, kebabs, butter chicken, and traditional regional dishes.",
    rating: 4.7,
    reviewCount: 106,
    image: "/images/chatori.jpg",
    priceRange: "$$",
    price: 300,
    isActive: true,
    isOpen: true,
    address: "Jhamsikhel, Lalitpur, Nepal",
    phone: "+977 1-5423174",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Samosa", "Street Chaat", "Butter Chicken", "Mango Lassi"],
  },
  {
    name: "Rasoi",
    cuisine: "Indian",
    location: "Bhaktapur",
    description: "A family-friendly Indian restaurant known for rich curries, tandoori platters, paneer dishes, and fresh naan.",
    rating: 4.6,
    reviewCount: 94,
    image: "/images/rasoi.jpg",
    priceRange: "$$",
    price: 275,
    isActive: true,
    isOpen: true,
    address: "Suryabinayak, Bhaktapur, Nepal",
    phone: "+977 1-6614028",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Paneer Butter Masala", "Dal Makhani", "Tandoori Platter", "Garlic Naan"],
  },
  {
    name: "Filili",
    cuisine: "Indian",
    location: "Kathmandu",
    description: "A contemporary Indian restaurant featuring regional specialties, biryani, kebabs, seafood curries, and signature desserts.",
    rating: 4.9,
    reviewCount: 151,
    image: "/images/filli.jpg",
    priceRange: "$$$",
    price: 475,
    isActive: true,
    isOpen: true,
    address: "Lazimpat, Kathmandu, Nepal",
    phone: "+977 1-4426085",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Hyderabadi Biryani", "Seafood Curry", "Chicken Tikka Masala", "Gulab Jamun"],
  },
  {
    name: "Parth",
    cuisine: "Indian",
    location: "Kathmandu",
    description: "A welcoming Indian restaurant serving traditional vegetarian and non-vegetarian dishes, tandoori platters, curries, and freshly baked breads.",
    rating: 4.7,
    reviewCount: 113,
    image: "/images/parth.jpg",
    priceRange: "$$",
    price: 325,
    isActive: true,
    isOpen: true,
    address: "Boudha, Kathmandu, Nepal",
    phone: "+977 1-4913752",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Tandoori Chicken", "Paneer Butter Masala", "Dal Makhani", "Fresh Naan"],
  },
  {
    name: "Tales",
    cuisine: "Indian",
    location: "Kathmandu",
    description: "An elegant Indian dining destination serving fragrant biryani, slow-cooked curries, tandoori favourites, and classic desserts.",
    rating: 4.8,
    reviewCount: 119,
    image: "/images/Tales.jpg",
    priceRange: "$$$",
    price: 400,
    isActive: true,
    isOpen: true,
    address: "Thamel, Kathmandu, Nepal",
    phone: "+977 1-4702286",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Chicken Tikka Masala", "Hyderabadi Biryani", "Garlic Naan", "Mango Lassi"],
  },
  {
    name: "Dim Sum Delight",
    cuisine: "Chinese",
    location: "Kathmandu",
    description: "A lively Chinese restaurant specialising in handmade dim sum, dumplings, bao, noodles, and traditional Cantonese dishes.",
    rating: 4.8,
    reviewCount: 128,
    image: "/images/Dimsun Delight.jpg",
    priceRange: "$$",
    price: 300,
    isActive: true,
    isOpen: true,
    address: "Thamel, Kathmandu, Nepal",
    phone: "+977 1-4703418",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Dim Sum Platter", "Steamed Chicken Dumplings", "Chicken Bao", "Hot and Sour Soup"],
  },
  {
    name: "Mandarin",
    cuisine: "Chinese",
    location: "Lalitpur",
    description: "An elegant Chinese restaurant offering Cantonese classics, Peking duck, seafood, noodles, and refined family-style dining.",
    rating: 4.7,
    reviewCount: 116,
    image: "/images/mandarin.jpg",
    priceRange: "$$$",
    price: 450,
    isActive: true,
    isOpen: true,
    address: "Jhamsikhel, Lalitpur, Nepal",
    phone: "+977 1-5425280",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Peking Duck", "Cantonese Seafood", "Chow Mein", "Dim Sum Platter"],
  },
  {
    name: "Jade",
    cuisine: "Chinese",
    location: "Kathmandu",
    description: "A modern Chinese restaurant serving stir-fried dishes, dumplings, fried rice, noodle bowls, and regional favourites.",
    rating: 4.6,
    reviewCount: 97,
    image: "/images/jade.jpg",
    priceRange: "$$",
    price: 275,
    isActive: true,
    isOpen: true,
    address: "Baluwatar, Kathmandu, Nepal",
    phone: "+977 1-4427136",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Kung Pao Chicken", "Egg Fried Rice", "Vegetable Spring Rolls", "Chow Mein"],
  },
  {
    name: "Dragon Wok",
    cuisine: "Chinese",
    location: "Bhaktapur",
    description: "A casual Chinese restaurant known for wok-fried noodles, spicy chicken, fried rice, dumplings, and bold Sichuan flavours.",
    rating: 4.7,
    reviewCount: 104,
    image: "/images/dragon wok.jpg",
    priceRange: "$$",
    price: 325,
    isActive: true,
    isOpen: true,
    address: "Suryabinayak, Bhaktapur, Nepal",
    phone: "+977 1-6615194",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Sichuan Chicken", "Wok-Fried Noodles", "Egg Fried Rice", "Steamed Chicken Dumplings"],
  },
  {
    name: "Lotus Garden",
    cuisine: "Chinese",
    location: "Kathmandu",
    description: "A peaceful Chinese dining destination featuring seafood, dim sum, hot pot, traditional soups, and vegetarian dishes.",
    rating: 4.8,
    reviewCount: 138,
    image: "/images/lotus garden.jpg",
    priceRange: "$$$",
    price: 425,
    isActive: true,
    isOpen: true,
    address: "Lazimpat, Kathmandu, Nepal",
    phone: "+977 1-4428162",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Seafood Hot Pot", "Dim Sum Platter", "Hot and Sour Soup", "Mapo Tofu"],
  },
  {
    name: "Red Lantern",
    cuisine: "Chinese",
    location: "Lalitpur",
    description: "A welcoming Chinese restaurant serving dumplings, chow mein, sweet and sour dishes, rice plates, and family favourites.",
    rating: 4.5,
    reviewCount: 83,
    image: "/images/red latern.jpg",
    priceRange: "$$",
    price: 250,
    isActive: true,
    isOpen: true,
    address: "Patan, Lalitpur, Nepal",
    phone: "+977 1-5526247",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Sweet and Sour Chicken", "Chow Mein", "Steamed Chicken Dumplings", "Egg Fried Rice"],
  },
  {
    name: "Red Pavilion",
    cuisine: "Chinese",
    location: "Kathmandu",
    description: "A premium Chinese restaurant offering Peking duck, Sichuan dishes, Cantonese seafood, dim sum, and elegant dining.",
    rating: 4.9,
    reviewCount: 156,
    image: "/images/red pavillion.jpg",
    priceRange: "$$$",
    price: 500,
    isActive: true,
    isOpen: true,
    address: "Durbar Marg, Kathmandu, Nepal",
    phone: "+977 1-4229305",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Peking Duck", "Sichuan Chicken", "Cantonese Seafood", "Dim Sum Platter"],
  },
  {
    name: "Tichuca Rooftop Bar",
    cuisine: "Thai",
    location: "Kathmandu",
    description: "A stylish rooftop Thai restaurant offering modern Thai dishes, grilled seafood, signature curries, refreshing drinks, and panoramic city views.",
    rating: 4.9,
    reviewCount: 164,
    image: "/images/Tichuca Rooftop Bar _ Bangkok.jpg",
    priceRange: "$$$",
    price: 475,
    isActive: true,
    isOpen: true,
    address: "Durbar Marg, Kathmandu, Nepal",
    phone: "+977 1-4227485",
    hours: "Mon-Sun: 11:00 AM - 11:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "9:00 PM"],
    features: ["Grilled Seafood", "Massaman Curry", "Papaya Salad", "Mango Sticky Rice"],
  },
  {
    name: "Sabai Di Mai",
    cuisine: "Thai",
    location: "Lalitpur",
    description: "A welcoming Thai restaurant serving pad thai, green curry, tom yum soup, basil chicken, fried rice, and traditional Thai favourites.",
    rating: 4.7,
    reviewCount: 112,
    image: "/images/sabai-di-mai.jpg",
    priceRange: "$$",
    price: 300,
    isActive: true,
    isOpen: true,
    address: "Jhamsikhel, Lalitpur, Nepal",
    phone: "+977 1-5426397",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Pad Thai", "Green Curry", "Tom Yum Soup", "Thai Basil Chicken"],
  },
  {
    name: "Siam",
    cuisine: "Thai",
    location: "Kathmandu",
    description: "An elegant Thai restaurant featuring authentic curries, seafood, noodle dishes, stir-fries, soups, and refined Thai dining.",
    rating: 4.8,
    reviewCount: 139,
    image: "/images/siam.jpg",
    priceRange: "$$$",
    price: 450,
    isActive: true,
    isOpen: true,
    address: "Lazimpat, Kathmandu, Nepal",
    phone: "+977 1-4429571",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: true,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Red Curry", "Seafood Pad Thai", "Tom Kha Gai", "Mango Sticky Rice"],
  },
  {
    name: "Tanrak",
    cuisine: "Thai",
    location: "Bhaktapur",
    description: "A cosy Thai restaurant known for spicy curries, pad see ew, tom kha soup, Thai fried rice, satay, and family-style dining.",
    rating: 4.6,
    reviewCount: 89,
    image: "/images/tanrak.jpg",
    priceRange: "$$",
    price: 275,
    isActive: true,
    isOpen: true,
    address: "Suryabinayak, Bhaktapur, Nepal",
    phone: "+977 1-6617304",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    featured: false,
    availableTimeSlots: ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"],
    features: ["Pad See Ew", "Tom Kha Gai", "Pineapple Fried Rice", "Chicken Satay"],
  },
];

const EXISTING_RESTAURANT_IMAGES = {
  "The Golden Truffle": "/images/Golden.jpg",
  "Sakura Omakase": "/images/sakura.jpg",
  "La Bella Italia": "/images/roma.jpg",
  "The Spice Route": "/images/osaka.jpg",
};

async function ensureNewRestaurants() {
  await Restaurant.bulkWrite(
    NEW_RESTAURANTS.map((restaurant) => ({
      updateOne: {
        filter: { name: restaurant.name },
        update: { $setOnInsert: restaurant },
        upsert: true,
      },
    })),
  );

  await Restaurant.bulkWrite(
    Object.entries(EXISTING_RESTAURANT_IMAGES).map(([name, image]) => ({
      updateOne: {
        filter: { name },
        update: { $set: { image } },
      },
    })),
  );

  // Keep the existing Trials record compatible with exact cuisine filtering.
  await Restaurant.updateOne({ name: "Trials" }, { $set: { cuisine: "Nepali" } });
}

function getStableRestaurantPrice(restaurant) {
  const numericPrice = Number(restaurant.price);
  if (Number.isFinite(numericPrice) && numericPrice >= 150 && numericPrice <= 500) return numericPrice;
  if (RESTAURANT_PRICES[restaurant.name]) return RESTAURANT_PRICES[restaurant.name];
  const key = String(restaurant._id || restaurant.id || restaurant.name || "");
  const hash = [...key].reduce((total, character) => total + character.charCodeAt(0), 0);
  return PRICE_OPTIONS[hash % PRICE_OPTIONS.length];
}

async function ensureRestaurantPrices(restaurants) {
  const updates = [];
  for (const restaurant of restaurants) {
    const price = getStableRestaurantPrice(restaurant);
    if (Number(restaurant.price) !== price) {
      restaurant.price = price;
      updates.push({ updateOne: { filter: { _id: restaurant._id }, update: { $set: { price } } } });
    }
  }
  if (updates.length) await Restaurant.bulkWrite(updates);
  return restaurants;
}

function createRestaurant(payload) {
  return Restaurant.create(payload);
}

async function findRestaurantById(id) {
  const restaurant = await Restaurant.findById(id);
  if (restaurant) await ensureRestaurantPrices([restaurant]);
  return restaurant;
}

async function listRestaurants(queryParams) {
  await ensureNewRestaurants();
  const { page, limit, skip } = parsePagination(queryParams);

  const search = String(queryParams.search || "").trim();
  const cuisine = String(queryParams.cuisine || "").trim();
  const location = String(queryParams.location || "").trim();
  const available = String(queryParams.available || "").trim().toLowerCase();

  let filter = {
    isActive: { $ne: false },
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { cuisine: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  if (cuisine) {
    filter.cuisine = {
      $regex: cuisine,
      $options: "i",
    };
  }

  if (location) {
    filter.location = {
      $regex: location,
      $options: "i",
    };
  }

  if (available === "true") filter.isOpen = true;
  if (available === "false") filter.isOpen = false;

  const [restaurants, total, availableTotal, cuisineTypes] = await Promise.all([
    Restaurant.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    Restaurant.countDocuments(filter),
    Restaurant.countDocuments({ ...filter, isOpen: true }),
    Restaurant.distinct("cuisine", filter),
  ]);

  await ensureRestaurantPrices(restaurants);

  return {
    restaurants,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      availableTotal,
      cuisineTypes: cuisineTypes.length,
    },
  };
}

async function updateRestaurant(id, payload) {
  return Restaurant.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

function deleteRestaurant(id) {
  return Restaurant.findByIdAndDelete(id);
}

module.exports = {
  createRestaurant,
  findRestaurantById,
  listRestaurants,
  ensureRestaurantPrices,
  updateRestaurant,
  deleteRestaurant,
};
