const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDirectory = path.join(process.cwd(), "uploads", "restaurants");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const uploadRestaurantImage = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) return callback(new Error("Only JPG, PNG, and WEBP images are allowed."));
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadRestaurantImage };
