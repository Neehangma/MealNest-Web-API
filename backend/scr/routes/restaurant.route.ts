const express = require("express");
const restaurantController = require("../controller/restaurant.controller");
const { authenticate, requireAdmin } = require("../middleware/authorized.middleware");
const { asyncHandler } = require("../utils/apihelper.utils");
const { uploadRestaurantImage } = require("../middleware/restaurant-upload");

const router = express.Router();

router.get("/", asyncHandler(restaurantController.getRestaurants));
router.get("/:id", asyncHandler(restaurantController.getRestaurantById));
router.post("/", authenticate, requireAdmin, uploadRestaurantImage.single("image"), asyncHandler(restaurantController.createRestaurant));
router.put("/:id", authenticate, requireAdmin, uploadRestaurantImage.single("image"), asyncHandler(restaurantController.updateRestaurant));
router.delete("/:id", authenticate, requireAdmin, asyncHandler(restaurantController.deleteRestaurant));

module.exports = router;
