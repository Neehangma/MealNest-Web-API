const PORT = process.env.PORT || 8088;
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  (process.env.NODE_ENV === "production" ? "" : "mongodb://127.0.0.1:27017/mealnest");
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "mealnest_super_secret_key");
if (process.env.NODE_ENV === "production" && !JWT_SECRET) {
  throw new Error("JWT_SECRET is required when NODE_ENV=production");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
const ALLOWED_ROLES = ["user", "admin"];

module.exports = {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
  ALLOWED_ROLES,
};
