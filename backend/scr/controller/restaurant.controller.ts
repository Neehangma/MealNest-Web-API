declare const require: any;
declare const module: any;

const {
  createRestaurantDto,
  createRestaurantUpdateDto,
} = require("../dtos/restaurant.dtos");
const restaurantRepository = require("../repositories/restaurant.repository");
const { HttpException } = require("../exceptions/http-exception");
const { sendSuccess } = require("../utils/apihelper.utils");
const { isPhoneNumberValid, PHONE_VALIDATION_MESSAGE } = require("../utils/phone-validation");

const SUPPORTED_CUISINES = new Set([
  "Italian", "Japanese", "Indian", "Chinese", "Thai", "Korean", "Nepali",
]);

function validateAdminPayload(payload, requirePhone = false) {
  if (payload.cuisine && !SUPPORTED_CUISINES.has(payload.cuisine)) {
    throw new HttpException(400, "Please select a supported cuisine.");
  }
  if ((requirePhone || payload.phone !== undefined) && !isPhoneNumberValid(payload.phone)) {
    throw new HttpException(400, PHONE_VALIDATION_MESSAGE);
  }
}

async function getRestaurants(req, res) {
  const result = await restaurantRepository.listRestaurants(req.query);
  return sendSuccess(res, 200, {
    data: result.restaurants,
    meta: result.meta,
  });
}

async function getRestaurantsByCuisine(req, res) {
  const result = await restaurantRepository.listRestaurants({ cuisine: req.params.cuisine, limit: 100 });
  const cuisine = String(req.params.cuisine).toLowerCase();
  const restaurants = result.restaurants.filter((restaurant) => restaurant.cuisine.toLowerCase() === cuisine);
  if (!restaurants.length) {
    throw new HttpException(404, "No restaurants found");
  }
  return sendSuccess(res, 200, {
    count: restaurants.length,
    restaurants,
  });
}

async function getRestaurantById(req, res) {
  const restaurant = await restaurantRepository.findRestaurantById(req.params.id);
  if (!restaurant) {
    return sendSuccess(res, 404, {
      message: "Restaurant not found",
    });
  }
  return sendSuccess(res, 200, {
    data: restaurant,
  });
}

async function createRestaurant(req, res) {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/restaurants/${req.file.filename}`;
  validateAdminPayload(payload, true);
  const restaurant = await restaurantRepository.createRestaurant(
    createRestaurantDto(payload)
  );
  return sendSuccess(res, 201, {
    message: "Restaurant created successfully",
    restaurant,
  });
}

async function updateRestaurant(req, res) {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/restaurants/${req.file.filename}`;
  validateAdminPayload(payload);
  const restaurant = await restaurantRepository.updateRestaurant(
    req.params.id,
    createRestaurantUpdateDto(payload)
  );
  if (!restaurant) {
    return sendSuccess(res, 404, {
      message: "Restaurant not found",
    });
  }
  return sendSuccess(res, 200, {
    message: "Restaurant updated successfully",
    data: restaurant,
  });
}

async function deleteRestaurant(req, res) {
  const restaurant = await restaurantRepository.deleteRestaurant(req.params.id);
  if (!restaurant) {
    return sendSuccess(res, 404, {
      message: "Restaurant not found",
    });
  }
  return sendSuccess(res, 200, {
    message: "Restaurant deleted successfully",
  });
}

module.exports = {
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getRestaurants,
  getRestaurantsByCuisine,
  updateRestaurant,
};
