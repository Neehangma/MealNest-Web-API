export const PORT = process.env.PORT || 8088;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mealnest";
export const JWT_SECRET = process.env.JWT_SECRET || "mealnest_super_secret_key";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
export const ALLOWED_ROLES = ["user", "admin"];
