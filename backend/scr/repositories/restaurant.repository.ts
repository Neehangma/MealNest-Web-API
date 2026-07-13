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
  Patio: 320, Trials: 450,
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
    cuisine: "Contemporary Nepali",
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

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    Restaurant.countDocuments(filter),
  ]);

  await ensureRestaurantPrices(restaurants);

  return {
    restaurants,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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
