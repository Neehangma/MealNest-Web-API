const Restaurant = require("../models/restaurant.model");
const User = require("../models/user.model");
const reviewRepository = require("../repositories/review.repository");
const { HttpException } = require("../exceptions/http-exception");
const { isValidObjectId } = require("../utils/apihelper.utils");

function formatReview(review) {
  return {
    _id: review._id.toString(),
    id: review._id.toString(),
    restaurantId: review.restaurantId.toString(),
    userId: review.userId.toString(),
    userName: review.userName,
    userProfileImage: review.userProfileImage || "",
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

async function requireRestaurant(restaurantId) {
  if (!isValidObjectId(restaurantId)) {
    throw new HttpException(400, "Invalid restaurant id");
  }
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new HttpException(404, "Restaurant not found");
  return restaurant;
}

async function listReviews(restaurantId) {
  await requireRestaurant(restaurantId);
  const reviews = await reviewRepository.listByRestaurant(restaurantId);
  return reviews.map(formatReview);
}

async function submitReview(restaurantId, userId, input) {
  await requireRestaurant(restaurantId);
  if (!isValidObjectId(userId)) throw new HttpException(400, "Invalid user id");

  const user = await User.findById(userId);
  if (!user) throw new HttpException(404, "User not found");

  const rating = Number(input.rating);
  const comment = String(input.comment || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpException(400, "Rating must be an integer from 1 to 5");
  }
  if (!comment) throw new HttpException(400, "Review comment is required");
  if (comment.length > 500) {
    throw new HttpException(400, "Review comment must not exceed 500 characters");
  }

  const review = await reviewRepository.upsertForUser(restaurantId, userId, {
    userName: user.fullName,
    userProfileImage: user.profilePicture || "",
    rating,
    comment,
  });
  return formatReview(review);
}

module.exports = { listReviews, submitReview };
