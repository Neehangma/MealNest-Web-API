const { ALLOWED_ROLES } = require("../config/constant");
const { HttpException } = require("../exceptions/http-exception");

const validateRegister = (req, _res, next) => {
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

const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return next(new HttpException(400, "Valid email is required"));
  }

  if (!password || typeof password !== "string") {
    return next(new HttpException(400, "Password is required"));
  }

  return next();
};

const validateAdminCreateUser = (req, _res, next) => {
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

const validateAdminUpdateUser = (req, _res, next) => {
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

const validateProfileUpdate = (req, _res, next) => {
  const { fullName, email, profilePicture } = req.body;

  if (fullName !== undefined && (typeof fullName !== "string" || fullName.trim().length === 0)) {
    return next(new HttpException(400, "Full name is required and must be a string"));
  }

  if (email !== undefined && (typeof email !== "string" || !isValidEmail(email))) {
    return next(new HttpException(400, "Valid email is required"));
  }

  if (profilePicture !== undefined) {
    const isDataImage =
      typeof profilePicture === "string" &&
      (profilePicture === "" || /^data:image\/(png|jpe?g|gif|webp);base64,/.test(profilePicture));

    if (!isDataImage) {
      return next(new HttpException(400, "Profile photo must be a valid image"));
    }

    if (profilePicture.length > 3_000_000) {
      return next(new HttpException(400, "Profile photo must be 2MB or smaller"));
    }
  }

  return next();
};

const validatePasswordChange = (req, _res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== "string") {
    return next(new HttpException(400, "Current password is required"));
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return next(new HttpException(400, "New password must be at least 6 characters"));
  }

  if (currentPassword === newPassword) {
    return next(new HttpException(400, "New password must be different"));
  }

  return next();
};

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validateAdminCreateUser,
  validateAdminUpdateUser,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateRegister,
};
