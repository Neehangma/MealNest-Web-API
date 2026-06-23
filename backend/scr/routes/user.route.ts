import { Router } from "express";
import { userController } from "../controller/user.controller";
import { authorize } from "../middleware/auth.middleware";
import { uploadProfileImage } from "../middleware/upload.middleware";

const router = Router();
const updateProfileHandlers = [
  authorize,
  uploadProfileImage,
  userController.updateProfile,
];
const updatePasswordHandlers = [
  authorize,
  userController.updateProfile,
];

router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);
router.get("/auth/whoami", authorize, userController.getProfile);
router.patch("/auth/update", updateProfileHandlers);
router.put("/auth/update", updateProfileHandlers);
router.patch("/auth/password", updatePasswordHandlers);
router.put("/auth/password", updatePasswordHandlers);
router.get("/profile", authorize, userController.getProfile);

export default router;
