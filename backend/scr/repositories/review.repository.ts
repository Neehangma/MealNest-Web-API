const Review = require("../models/review.model");

function listByRestaurant(restaurantId) {
  return Review.find({ restaurantId }).sort({ updatedAt: -1 });
}

function upsertForUser(restaurantId, userId, payload) {
  return Review.findOneAndUpdate(
    { restaurantId, userId },
    {
      $set: {
        userName: payload.userName,
        userProfileImage: payload.userProfileImage,
        rating: payload.rating,
        comment: payload.comment,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}

module.exports = { listByRestaurant, upsertForUser };
