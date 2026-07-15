declare const require: any;
declare const module: any;

const {
  createRestaurantDto,
  createRestaurantUpdateDto,
} = require("../dtos/restaurant.dtos");
const restaurantRepository = require("../repositories/restaurant.repository");
const { HttpException } = require("../exceptions/http-exception");
const { sendSuccess } = require("../utils/apihelper.utils");

const SUPPORTED_CUISINES = new Set([
  "Italian", "Japanese", "Indian", "Chinese", "Thai", "Korean", "Nepali",
]);

function validateAdminPayload(payload) {
  if (payload.cuisine && !SUPPORTED_CUISINES.has(payload.cuisine)) {
    throw new HttpException(400, "Please select a supported cuisine.");
  }
  if (payload.phone && !/^[0-9+()\-\s]{7,20}$/.test(payload.phone)) {
    throw new HttpException(400, "Please enter a valid phone number.");
  }
}

async function getRestaurants(req, res) {
  const result = await restaurantRepository.listRestaurants(req.query);
  return sendSuccess(res, 200, {
    data: result.restaurants,
    meta: result.meta,
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
  validateAdminPayload(payload);
  const restaurant = await restaurantRepository.createRestaurant(
    createRestaurantDto(payload)
  );
  return sendSuccess(res, 201, {
    message: "Restaurant created successfully",
    data: restaurant,
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
  updateRestaurant,
};
