import fs from "fs";
import path from "path";
import multer from "multer";
import { HttpException } from "../exceptions/http-exception";

const uploadRoot = path.join(process.cwd(), "uploads");
const profileUploadDir = path.join(uploadRoot, "profiles");

fs.mkdirSync(profileUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new HttpException(400, "Only image uploads are allowed"));
  }

  return cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export const uploadProfileImage = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
  { name: "profileimage", maxCount: 1 },
]);
