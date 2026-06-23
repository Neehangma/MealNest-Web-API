import { NextFunction, Request, Response } from "express";
import { AuthorizedRequest } from "../middleware/auth.middleware";
import { userService } from "../services/user.service";
import { sendSuccess } from "../utils/apihelper.utils";

export const userController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await userService.register(req.body);
      return sendSuccess(res, 201, "Registration successful", data);
    } catch (error) {
      return next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await userService.login(req.body);
      return sendSuccess(res, 200, "Login successful", data);
    } catch (error) {
      return next(error);
    }
  },

  getProfile: async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      const data = await userService.getProfile(req.user?.id);
      return sendSuccess(res, 200, "Profile fetched successfully", data);
    } catch (error) {
      return next(error);
    }
  },

  updateProfile: async (
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const files = req.files as
        | Record<string, Express.Multer.File[]>
        | undefined;
      const file =
        files?.image?.[0] ||
        files?.profileImage?.[0] ||
        files?.profileimage?.[0];
      const image = file ? `/uploads/profiles/${file.filename}` : undefined;
      const data = await userService.updateProfile(req.user?.id, req.body, image);
      const message = data.passwordUpdated
        ? "Password changed successfully"
        : "Profile updated successfully";

      return sendSuccess(res, 200, message, data);
    } catch (error) {
      return next(error);
    }
  },
};
