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

async function updateRestaurantReview(req, res) {
  const review = await reviewService.updateReview(
    req.params.restaurantId,
    req.params.reviewId,
    req.user._id,
    req.body,
  );
  return sendSuccess(res, 200, {
    message: "Review updated successfully",
    data: review,
    review,
  });
}

async function getAdminReviews(req, res) {
  const result = await reviewService.listAdminReviews(req.query);
  return sendSuccess(res, 200, result);
}

async function getAdminReviewAnalytics(req, res) {
  const data = await reviewService.getAdminReviewAnalytics(String(req.query.range || "7d"));
  return sendSuccess(res, 200, data);
}

async function updateAdminReviewStatus(req, res) {
  const review = await reviewService.moderateReview(req.params.reviewId, String(req.body.status || "").toLowerCase());
  return sendSuccess(res, 200, {
    message: review.status === "hidden" ? "Review hidden successfully" : "Review published successfully",
    data: review,
  });
}

async function deleteAdminReview(req, res) {
  await reviewService.deleteReview(req.params.reviewId);
  return sendSuccess(res, 200, { message: "Review permanently deleted" });
}

module.exports = {
  deleteAdminReview,
  getAdminReviewAnalytics,
  getAdminReviews,
  getRestaurantReviews,
  submitRestaurantReview,
  updateAdminReviewStatus,
  updateRestaurantReview,
};
