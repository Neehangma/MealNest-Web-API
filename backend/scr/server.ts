require("dotenv").config({ quiet: true });
const chatbotRoutesModule = require("./routes/chatbotRoutes");
const chatbotRoutes = chatbotRoutesModule.default || chatbotRoutesModule;

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const { PORT } = require("./config/constant");
const { connectMongo } = require("./database/mongodb");
const { HttpException } = require("./exceptions/http-exception");
const userRoutes = require("./routes/user.route");
const restaurantRoutes = require("./routes/restaurant.route");
const { sendError } = require("./utils/apihelper.utils");


const app = express();

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

const allowedOrigins = new Set(
  ["http://localhost:3000", process.env.FRONTEND_URL]
    .map(normalizeOrigin)
    .filter(Boolean)
);

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new HttpException(403, "Origin is not allowed by CORS"));
  },
}));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.send("MealNest Backend Running");
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "MealNest API is running" });
});

// Public restaurant browsing must be registered before the authenticated
// catch-all user routes that expose the same path.
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api", userRoutes);
// MealNest AI chatbot (authenticated users only).
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/ai-assistant", chatbotRoutes);

app.use((_req, _res, next) => {
  next(new HttpException(404, "Route not found"));
});

app.use((error, _req, res, _next) => {
  const isUploadError = error.name === "MulterError" || String(error.message || "").includes("Only JPG, PNG, and WEBP");
  const status = isUploadError ? 400 : error.status || 500;
  const message = error.message || "Internal server error";

  if (status >= 500) {
    console.error(error);
  }

  return sendError(res, status, message, error.details);
});

const startServer = () => {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`MealNest backend running on port ${PORT}`);
    console.log(`Local API base URL: http://127.0.0.1:${PORT}/api`);
    console.log(`Flutter Android emulator API base URL: http://10.0.2.2:${PORT}/api`);
  });

  server.on("error", (error) => {
    console.error(`Server error: ${error.message}`);
    process.exit(1);
  });

  connectMongo()
    .then(() => {
      console.log(`Database connected: ${mongoose.connection.name}`);
    })
    .catch((error) => {
      console.error(`Database error: ${error.message}`);
      if (process.env.NODE_ENV === "production") {
        server.close(() => process.exit(1));
      }
    });

  return server;
};

if (process.env.NODE_ENV !== "test") startServer();

module.exports = app;
