const Review = require("../models/review.model");

function listByRestaurant(restaurantId) {
  return Review.find({ restaurantId }).sort({ createdAt: -1 });
}

function findByReservation(reservationId) {
  return Review.findOne({ reservationId });
}

function findByReservationIds(reservationIds, userId) {
  return Review.find({ reservationId: { $in: reservationIds }, userId });
}

function create(payload) {
  return Review.create(payload);
}

function findOwnedById(reviewId, userId) {
  return Review.findOne({ _id: reviewId, userId });
}

async function updateOwned(reviewId, userId, payload) {
  return Review.findOneAndUpdate(
    { _id: reviewId, userId },
    { $set: payload },
    { returnDocument: "after", runValidators: true },
  );
}

function ratingSummary(restaurantId) {
  return Review.aggregate([
    { $match: { restaurantId } },
    { $group: { _id: "$restaurantId", rating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);
}

module.exports = {
  create,
  findByReservation,
  findByReservationIds,
  findOwnedById,
  listByRestaurant,
  ratingSummary,
  updateOwned,
};
