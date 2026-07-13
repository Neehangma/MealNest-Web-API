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
};

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
  const { page, limit, skip } = parsePagination(queryParams);

  const search = String(queryParams.search || "").trim();
  const cuisine = String(queryParams.cuisine || "").trim();
  const location = String(queryParams.location || "").trim();

  let filter = {
    isActive: true,
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
