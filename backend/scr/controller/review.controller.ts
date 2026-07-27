const reviewService = require("../services/review.service");
const { sendSuccess } = require("../utils/apihelper.utils");

async function getRestaurantReviews(req, res) {
  const reviews = await reviewService.listReviews(req.params.restaurantId);
  return sendSuccess(res, 200, {
    count: reviews.length,
    data: reviews,
    reviews,
  });
}

async function submitRestaurantReview(req, res) {
  const review = await reviewService.submitReview(
    req.params.restaurantId,
    req.user._id,
    req.body,
  );
  return sendSuccess(res, 201, {
    message: "Review saved successfully",
    data: review,
    review,
  });
}

module.exports = { getRestaurantReviews, submitRestaurantReview };
