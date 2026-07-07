const Restaurant = require("../models/restaurant.model");
const { parsePagination } = require("../utils/apihelper.utils");

function createRestaurant(payload) {
  return Restaurant.create(payload);
}

function findRestaurantById(id) {
  return Restaurant.findById(id);
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
  updateRestaurant,
  deleteRestaurant,
};