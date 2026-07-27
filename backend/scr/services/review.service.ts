const Restaurant = require("../models/restaurant.model");
const Reservation = require("../models/reservation.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const reviewRepository = require("../repositories/review.repository");
const { HttpException } = require("../exceptions/http-exception");
const { isValidObjectId, parsePagination } = require("../utils/apihelper.utils");

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
    status: review.status || "published",
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function formatAdminReview(review) {
  return {
    _id: review._id.toString(),
    id: review._id.toString(),
    userId: review.userId?.toString() || "",
    restaurantId: review.restaurantId?.toString() || "",
    reservationId: review.reservationId?.toString() || "",
    customer: {
      name: review.user?.fullName || review.userName || "Deleted user",
      email: review.user?.email || "",
    },
    restaurant: {
      name: review.restaurant?.name || "Deleted restaurant",
      cuisine: review.restaurant?.cuisine || "",
    },
    reservation: review.reservation ? {
      date: review.reservation.date || review.reservation.reservationDate,
      reservationDate: review.reservation.reservationDate,
      time: review.reservation.time || "",
      status: review.reservation.status || "",
    } : null,
    rating: review.rating,
    comment: review.comment,
    status: review.status || "published",
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

async function listAdminReviews(query) {
  const { page, limit, skip } = parsePagination(query);
  const rating = query.rating ? Number(query.rating) : 0;
  if (rating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    throw new HttpException(400, "Rating filter must be between 1 and 5");
  }
  const status = String(query.status || "all").toLowerCase();
  if (!["all", "published", "hidden"].includes(status)) {
    throw new HttpException(400, "Review status must be published or hidden");
  }
  const sort = String(query.sort || "newest").toLowerCase();
  if (!["newest", "oldest", "highest", "lowest"].includes(sort)) {
    throw new HttpException(400, "Invalid review sort");
  }
  const restaurantId = String(query.restaurantId || "");
  if (restaurantId && !isValidObjectId(restaurantId)) {
    throw new HttpException(400, "Invalid restaurant id");
  }
  const search = String(query.search || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const [result, restaurants] = await Promise.all([
    reviewRepository.adminList({
      status,
      rating,
      restaurantId: restaurantId ? new mongoose.Types.ObjectId(restaurantId) : null,
      search,
      sort,
      skip,
      limit,
    }),
    Restaurant.find({ isActive: { $ne: false } }).select("name").sort({ name: 1 }).lean(),
  ]);
  const data = result[0]?.data || [];
  const total = result[0]?.count?.[0]?.total || 0;
  return {
    data: data.map(formatAdminReview),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    restaurantOptions: restaurants.map((restaurant) => ({
      id: restaurant._id.toString(),
      name: restaurant.name,
    })),
  };
}

async function moderateReview(reviewId, status) {
  if (!isValidObjectId(reviewId)) throw new HttpException(400, "Invalid review id");
  if (!["published", "hidden"].includes(status)) {
    throw new HttpException(400, "Review status must be published or hidden");
  }
  const existing = await reviewRepository.findById(reviewId);
  if (!existing) throw new HttpException(404, "Review not found");
  const review = await reviewRepository.updateStatus(reviewId, status);
  await refreshRestaurantRating(existing.restaurantId);
  return formatReview(review);
}

async function deleteReview(reviewId) {
  if (!isValidObjectId(reviewId)) throw new HttpException(400, "Invalid review id");
  const review = await reviewRepository.deleteById(reviewId);
  if (!review) throw new HttpException(404, "Review not found");
  await refreshRestaurantRating(review.restaurantId);
}

function analyticsStart(range) {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (range === "6m") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 6);
    return start;
  }
  throw new HttpException(400, "Review analytics range must be 7d, 30d, or 6m");
}

async function getAdminReviewAnalytics(range = "7d") {
  const [summaryRows, distributionRows, restaurantRows, recentRows] = await reviewRepository.adminAnalytics(analyticsStart(range));
  const summary = summaryRows[0] || {};
  const distribution = new Map(distributionRows.map((item) => [item._id, item.count]));
  return {
    summary: {
      totalReviews: summary.totalReviews || 0,
      averageRating: summary.averageRating ? Math.round(summary.averageRating * 10) / 10 : 0,
      reviewsThisWeek: summary.reviewsThisWeek || 0,
      oneStarReviews: summary.oneStarReviews || 0,
    },
    reviewsInRange: summary.reviewsInRange || 0,
    ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: distribution.get(rating) || 0 })),
    topReviewedRestaurants: restaurantRows.map((item) => ({
      restaurantId: item._id.toString(),
      name: item.restaurant?.name || "Deleted restaurant",
      cuisine: item.restaurant?.cuisine || "",
      reviewCount: item.count,
    })),
    recentReviews: recentRows.map((review) => ({
      _id: review._id.toString(),
      customerName: review.userId?.fullName || review.userName || "Deleted user",
      restaurantName: review.restaurantId?.name || "Deleted restaurant",
      rating: review.rating,
      comment: review.comment,
      status: review.status || "published",
      createdAt: review.createdAt,
    })),
  };
}

module.exports = {
  deleteReview,
  getAdminReviewAnalytics,
  listAdminReviews,
  listReviews,
  moderateReview,
  submitReview,
  updateReview,
};
