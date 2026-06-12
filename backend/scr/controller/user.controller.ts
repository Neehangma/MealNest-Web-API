import { NextFunction, Request, Response } from "express";
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
};
