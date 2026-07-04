const express = require("express");
const userController = require("../controller/user.controller");
const { authenticate, requireAdmin } = require("../middleware/authorized.middleware");
const {
  validateAdminCreateUser,
  validateAdminUpdateUser,
  validateLogin,
  validateRegister,
} = require("../middleware/validation");
const { asyncHandler } = require("../utils/apihelper.utils");

const router = express.Router();

router.post("/auth/register", validateRegister, asyncHandler(userController.register));
router.post("/auth/login", validateLogin, asyncHandler(userController.login));
router.get("/auth/current", authenticate, asyncHandler(userController.current));

router.get("/admin/users", authenticate, requireAdmin, asyncHandler(userController.listUsers));
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
