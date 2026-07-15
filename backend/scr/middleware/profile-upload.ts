const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDirectory = path.join(process.cwd(), "uploads", "profiles");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
});

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const uploadProfileImage = multer({
  storage,
  fileFilter: (_req, file, callback) => allowedTypes.has(file.mimetype) ? callback(null, true) : callback(new Error("Only JPG, PNG, and WEBP images are allowed.")),
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadProfileImage };
