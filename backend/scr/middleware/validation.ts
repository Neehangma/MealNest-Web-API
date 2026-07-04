import { ALLOWED_ROLES } from "../config/constant";
import { HttpException } from "../exceptions/http-exception";

export const validateRegister = (req, _res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
    return next(new HttpException(400, "Full name is required and must be a string"));
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return next(new HttpException(400, "Valid email is required"));
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return next(new HttpException(400, "Password must be at least 6 characters"));
  }

  return next();
};

export const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return next(new HttpException(400, "Valid email is required"));
  }

  if (!password || typeof password !== "string") {
    return next(new HttpException(400, "Password is required"));
  }

  return next();
};

export const validateAdminCreateUser = (req, _res, next) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
    return next(new HttpException(400, "Full name is required and must be a string"));
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return next(new HttpException(400, "Valid email is required"));
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return next(new HttpException(400, "Password must be at least 6 characters"));
  }

  if (role && !ALLOWED_ROLES.includes(role)) {
    return next(new HttpException(400, "Role must be either 'user' or 'admin'"));
  }

  return next();
};

export const validateAdminUpdateUser = (req, _res, next) => {
  const { email, password, role } = req.body;

  if (email !== undefined && (typeof email !== "string" || !isValidEmail(email))) {
    return next(new HttpException(400, "Valid email is required"));
  }

  if (password !== undefined && password !== "" && (typeof password !== "string" || password.length < 6)) {
    return next(new HttpException(400, "Password must be at least 6 characters"));
  }

  if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
    return next(new HttpException(400, "Role must be either 'user' or 'admin'"));
  }

  return next();
};

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

