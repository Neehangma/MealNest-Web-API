declare const require: any;
declare const module: any;

const {
  createRestaurantDto,
  createRestaurantUpdateDto,
} = require("../dtos/restaurant.dtos");
const restaurantRepository = require("../repositories/restaurant.repository");
const { sendSuccess } = require("../utils/apihelper.utils");

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
  const restaurant = await restaurantRepository.createRestaurant(
    createRestaurantDto(req.body)
  );
  return sendSuccess(res, 201, {
    message: "Restaurant created successfully",
    data: restaurant,
  });
}

async function updateRestaurant(req, res) {
  const restaurant = await restaurantRepository.updateRestaurant(
    req.params.id,
    createRestaurantUpdateDto(req.body)
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