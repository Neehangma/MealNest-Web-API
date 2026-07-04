const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/constant");
const { HttpException } = require("../exceptions/http-exception");
const userRepository = require("../repositories/user.repository");

async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpException(401, "Authorization token is required");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw new HttpException(401, "User no longer exists");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof HttpException) return next(error);
    return next(new HttpException(401, "Invalid or expired token"));
  }
}

function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new HttpException(403, "Admin access required"));
  }

  return next();
}

module.exports = {
  authenticate,
  requireAdmin,
};
