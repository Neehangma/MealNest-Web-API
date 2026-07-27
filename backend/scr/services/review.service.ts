const Restaurant = require("../models/restaurant.model");
const Reservation = require("../models/reservation.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const reviewRepository = require("../repositories/review.repository");
const { HttpException } = require("../exceptions/http-exception");
const { isValidObjectId } = require("../utils/apihelper.utils");

function formatReview(review) {
  return {
    _id: review._id.toString(),
    id: review._id.toString(),
    restaurantId: review.restaurantId.toString(),
    userId: review.userId.toString(),
    reservationId: review.reservationId?.toString() || "",
    userName: review.userName,
    userProfileImage: review.userProfileImage || "",
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function reservationMoment(reservation) {
  const dateText = String(reservation.date || reservation.reservationDate || "").slice(0, 10);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateText)
    ? new Date(`${dateText}T00:00:00`)
    : new Date(reservation.reservationDate);
  const match = String(reservation.time || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match || Number.isNaN(date.getTime())) return date;
  let hours = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  date.setHours(hours, Number(match[2]), 0, 0);
  return date;
}

async function requireReviewableReservation(reservationId, restaurantId, userId) {
  if (!isValidObjectId(reservationId)) throw new HttpException(400, "Invalid reservation id");
  const reservation = await Reservation.findOne({ _id: reservationId, user: userId });
  if (!reservation) throw new HttpException(404, "Reservation not found");
  if (reservation.restaurant.toString() !== restaurantId.toString()) {
    throw new HttpException(400, "Reservation does not belong to this restaurant");
  }
  if (reservation.status === "cancelled") {
    throw new HttpException(400, "Cancelled reservations cannot be reviewed");
  }
  const hasPassed = reservationMoment(reservation).getTime() <= Date.now();
  if (reservation.status !== "completed" && !hasPassed) {
    throw new HttpException(400, "Reviews can only be submitted after your reservation has been completed");
  }
  return reservation;
}

async function refreshRestaurantRating(restaurantId) {
  const [summary] = await reviewRepository.ratingSummary(new mongoose.Types.ObjectId(restaurantId));
  const rating = summary ? Math.round(summary.rating * 10) / 10 : 0;
  const reviewCount = summary?.reviewCount || 0;
  await Restaurant.findByIdAndUpdate(restaurantId, { rating, reviewCount });
  return { rating, reviewCount };
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

  const reservationId = String(input.reservationId || "");
  await requireReviewableReservation(reservationId, restaurantId, userId);
  if (await reviewRepository.findByReservation(reservationId)) {
    throw new HttpException(409, "A review has already been submitted for this reservation");
  }

  try {
    const review = await reviewRepository.create({
      restaurantId,
      userId,
      reservationId,
      userName: user.fullName,
      userProfileImage: user.profilePicture || "",
      rating,
      comment,
    });
    await refreshRestaurantRating(restaurantId);
    return formatReview(review);
  } catch (error) {
    if (error?.code === 11000) {
      throw new HttpException(409, "A review has already been submitted for this reservation");
    }
    throw error;
  }
}

async function updateReview(restaurantId, reviewId, userId, input) {
  await requireRestaurant(restaurantId);
  if (!isValidObjectId(reviewId)) throw new HttpException(400, "Invalid review id");
  const current = await reviewRepository.findOwnedById(reviewId, userId);
  if (!current || current.restaurantId.toString() !== restaurantId.toString()) {
    throw new HttpException(404, "Review not found");
  }
  await requireReviewableReservation(current.reservationId, restaurantId, userId);

  const rating = Number(input.rating);
  const comment = String(input.comment || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpException(400, "Rating must be an integer from 1 to 5");
  }
  if (!comment) throw new HttpException(400, "Review comment is required");
  if (comment.length > 500) {
    throw new HttpException(400, "Review comment must not exceed 500 characters");
  }

  const review = await reviewRepository.updateOwned(reviewId, userId, {
    userName: current.userName,
    userProfileImage: current.userProfileImage,
    rating,
    comment,
  });
  await refreshRestaurantRating(restaurantId);
  return formatReview(review);
}

module.exports = { listReviews, submitReview, updateReview };
