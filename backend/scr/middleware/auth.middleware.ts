import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/constant";
import { HttpException } from "../exceptions/http-exception";
import { AuthRequestUser } from "../types/user.type";

export interface AuthorizedRequest extends Request {
  user?: AuthRequestUser;
}

export const authorize = (
  req: AuthorizedRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!token) {
      throw new HttpException(401, "Authorization token is required");
    }

    req.user = jwt.verify(token, env.jwtSecret) as AuthRequestUser;
    return next();
  } catch (error) {
    return next(
      error instanceof HttpException
        ? error
        : new HttpException(401, "Invalid token"),
    );
  }
};
