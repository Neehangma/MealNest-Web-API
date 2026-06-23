import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { uploadProfileImage } from "../config/multer";
import { authorize } from "../middleware/auth.middleware";

const router = Router();
const updateProfileHandlers = [
  authorize,
  uploadProfileImage,
  authController.updateProfile,
];
const updatePasswordHandlers = [
  authorize,
  authController.updateProfile,
];

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/whoami", authorize, authController.whoami);
router.patch("/auth/update", updateProfileHandlers);
router.put("/auth/update", updateProfileHandlers);
router.patch("/auth/password", updatePasswordHandlers);
router.put("/auth/password", updatePasswordHandlers);
router.get("/profile", authorize, authController.whoami);

export default router;
