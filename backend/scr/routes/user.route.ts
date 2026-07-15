const express = require("express");
const userController = require("../controller/user.controller");
const { authenticate, requireAdmin } = require("../middleware/authorized.middleware");
const {
  validateAdminCreateUser,
  validateAdminUpdateUser,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateRegister,
} = require("../middleware/validation");
const { asyncHandler } = require("../utils/apihelper.utils");
const { uploadProfileImage } = require("../middleware/profile-upload");

const router = express.Router();

router.post("/auth/register", validateRegister, asyncHandler(userController.register));
router.post("/auth/login", validateLogin, asyncHandler(userController.login));
router.get("/auth/current", authenticate, asyncHandler(userController.current));
router.patch("/profile", authenticate, validateProfileUpdate, asyncHandler(userController.updateProfile));
router.patch(
  "/profile/password",
  authenticate,
  validatePasswordChange,
  asyncHandler(userController.changePassword)
);

router.get("/dashboard", authenticate, asyncHandler(userController.getDashboard));
router.get("/restaurants", authenticate, asyncHandler(userController.listRestaurants));
router.get("/restaurants/:id", authenticate, asyncHandler(userController.getRestaurant));
router.get("/favorites", authenticate, asyncHandler(userController.getDashboard));
router.post("/favorites/:restaurantId", authenticate, asyncHandler(userController.toggleFavorite));
router.delete("/favorites/:restaurantId", authenticate, asyncHandler(userController.toggleFavorite));
router.post("/reservations", authenticate, asyncHandler(userController.createReservation));
router.get("/reservations/my-bookings", authenticate, asyncHandler(userController.listMyReservations));
router.get("/bookings/my-bookings", authenticate, asyncHandler(userController.listMyReservations));
router.patch("/bookings/:reservationId/cancel", authenticate, asyncHandler(userController.cancelReservation));
router.patch("/reservations/:reservationId", authenticate, asyncHandler(userController.updateReservation));
router.delete("/reservations/:reservationId", authenticate, asyncHandler(userController.cancelReservation));

router.get("/admin/users", authenticate, requireAdmin, asyncHandler(userController.listUsers));
router.get("/admin/bookings", authenticate, requireAdmin, asyncHandler(userController.listAdminReservations));
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
