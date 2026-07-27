const express = require("express");
const userController = require("../controller/user.controller");
const reviewController = require("../controller/review.controller");
const { authenticate, requireAdmin } = require("../middleware/authorized.middleware");
const {
  validateAdminCreateUser,
  validateAdminUpdateUser,
  validateForgotPassword,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateRegister,
  validateResetPassword,
} = require("../middleware/validation");
const { asyncHandler } = require("../utils/apihelper.utils");
const { uploadProfileImage } = require("../middleware/profile-upload");

const router = express.Router();

router.post("/auth/register", validateRegister, asyncHandler(userController.register));
router.post("/auth/login", validateLogin, asyncHandler(userController.login));
router.post("/auth/forgot-password", validateForgotPassword, asyncHandler(userController.forgotPassword));
router.post("/auth/reset-password/:token", validateResetPassword, asyncHandler(userController.resetPassword));
router.get("/auth/current", authenticate, asyncHandler(userController.current));
router.patch("/profile", authenticate, validateProfileUpdate, asyncHandler(userController.updateProfile));
router.patch(
  "/profile/password",
  authenticate,
  validatePasswordChange,
  asyncHandler(userController.changePassword)
);

router.get("/dashboard", authenticate, asyncHandler(userController.getDashboard));
router.get("/restaurants", authenticate, asyncHandler(userController.getRestaurants));
router.get("/restaurants/:id", authenticate, asyncHandler(userController.getRestaurant));
router.get("/favorites", authenticate, asyncHandler(userController.getDashboard));
router.post("/favorites/:restaurantId", authenticate, asyncHandler(userController.toggleFavorite));
router.delete("/favorites/:restaurantId", authenticate, asyncHandler(userController.toggleFavorite));
router.post("/reservations", authenticate, asyncHandler(userController.createReservation));
router.post("/bookings", authenticate, asyncHandler(userController.createReservation));
router.get("/reservations/my-bookings", authenticate, asyncHandler(userController.listMyReservations));
router.get("/bookings/my-bookings", authenticate, asyncHandler(userController.listMyReservations));
router.get("/bookings/:reservationId", authenticate, asyncHandler(userController.getReservation));
router.patch("/bookings/:reservationId/cancel", authenticate, asyncHandler(userController.cancelReservation));
router.patch("/reservations/:reservationId", authenticate, asyncHandler(userController.updateReservation));
router.delete("/reservations/:reservationId", authenticate, asyncHandler(userController.cancelReservation));
router.post("/email/send-confirmation", authenticate, asyncHandler(userController.sendReservationConfirmation));

router.get("/admin/users", authenticate, requireAdmin, asyncHandler(userController.listUsers));
router.get("/admin/bookings", authenticate, requireAdmin, asyncHandler(userController.listAdminReservations));
router.get("/admin/bookings/grouped-by-restaurant", authenticate, requireAdmin, asyncHandler(userController.listGroupedAdminReservations));
router.get("/admin/restaurants/:restaurantId/bookings", authenticate, requireAdmin, asyncHandler(userController.listAdminReservationsByRestaurant));
router.get("/admin/restaurants/:restaurantId", authenticate, requireAdmin, asyncHandler(userController.getAdminRestaurantDetails));
router.patch("/admin/bookings/:reservationId/complete", authenticate, requireAdmin, asyncHandler(userController.completeAdminReservation));
router.get("/admin/dashboard/stats", authenticate, requireAdmin, asyncHandler(userController.getAdminDashboardStats));
router.get("/admin/analytics", authenticate, requireAdmin, asyncHandler(userController.getAdminAnalytics));
router.get("/admin/reviews", authenticate, requireAdmin, asyncHandler(reviewController.getAdminReviews));
router.get("/admin/reviews/analytics", authenticate, requireAdmin, asyncHandler(reviewController.getAdminReviewAnalytics));
router.patch("/admin/reviews/:reviewId/status", authenticate, requireAdmin, asyncHandler(reviewController.updateAdminReviewStatus));
router.delete("/admin/reviews/:reviewId", authenticate, requireAdmin, asyncHandler(reviewController.deleteAdminReview));
router.get("/admin/profile", authenticate, requireAdmin, asyncHandler(userController.getAdminProfile));
router.put("/admin/profile", authenticate, requireAdmin, uploadProfileImage.single("profileImage"), asyncHandler(userController.updateAdminProfile));
router.get("/admin/users/:id", authenticate, requireAdmin, asyncHandler(userController.getUser));
router.post(
  "/admin/users",
  authenticate,
  requireAdmin,
  validateAdminCreateUser,
  asyncHandler(userController.createUser)
);
router.put(
  "/admin/users/:id",
  authenticate,
  requireAdmin,
  validateAdminUpdateUser,
  asyncHandler(userController.updateUser)
);
router.patch(
  "/admin/users/:id",
  authenticate,
  requireAdmin,
  validateAdminUpdateUser,
  asyncHandler(userController.updateUser)
);
router.delete("/admin/users/:id", authenticate, requireAdmin, asyncHandler(userController.deleteUser));

module.exports = router;
