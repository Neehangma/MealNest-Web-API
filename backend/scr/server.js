require("dotenv").config();

import cors from "cors";
import express, { json } from "express";
import { connection } from "mongoose";

// The original scaffold uses .ts filenames, but the project runs directly with Node.
require.extensions[".ts"] = require.extensions[".js"];

import { PORT } from "./config/constant";
import { connectMongo } from "./database/mongodb";
import { HttpException } from "./exceptions/http-exception";
import userRoutes from "./routes/user.route";
import { sendError } from "./utils/apihelper.utils";

const app = express();

app.use(cors());
app.use(json());

app.get("/", (_req, res) => {
  res.send("MealNest Backend Running");
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "MealNest Backend Running" });
});

app.use("/api/v1", userRoutes);

// Backward-compatible auth endpoints used by earlier frontend iterations.
app.use("/api", userRoutes);

app.use((_req, _res, next) => {
  next(new HttpException(404, "Route not found"));
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";

  if (status >= 500) {
    console.error(error);
  }

  return sendError(res, status, message, error.details);
});

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`MongoDB connected: ${connection.name}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

export default app;
