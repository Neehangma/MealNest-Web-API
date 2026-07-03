import { Request, Response, NextFunction } from "express";
import { HttpException } from "../exceptions/http-exception";

export const validateRegister = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { fullName, email, password } = req.body;

  if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
    throw new HttpException(400, "Full name is required and must be a string");
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    throw new HttpException(400, "Valid email is required");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    throw new HttpException(400, "Password must be at least 6 characters");
  }

  next();
};

export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    throw new HttpException(400, "Valid email is required");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    throw new HttpException(400, "Password is required");
  }

  next();
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
