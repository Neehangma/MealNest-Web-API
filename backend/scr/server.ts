require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const { PORT } = require("./config/constant");
const { connectMongo } = require("./database/mongodb");
const { HttpException } = require("./exceptions/http-exception");
const userRoutes = require("./routes/user.route");
const { sendError } = require("./utils/apihelper.utils");


const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/", (_req, res) => {
  res.send("MealNest Backend Running");
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "MealNest Backend Running" });
});

app.use("/api/v1", userRoutes);
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

const restaurantRoutes = require("./routes/restaurant.route");
app.use("/api/v1/restaurants", restaurantRoutes);

const startServer = () => {
  console.log(`Starting MealNest backend on port ${PORT}`);

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://127.0.0.1:${PORT}/api/health`);
  });

  connectMongo()
    .then(() => {
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });

  return server;
};

startServer();

module.exports = app;