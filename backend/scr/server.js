require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const { PORT } = require("./config/constant.js");
const { connectMongo } = require("./database/mongodb.js");
const { HttpException } = require("./exceptions/http-exception.js");
const userRoutes = require("./routes/user.route.js");
const { sendError } = require("./utils/apihelper.utils.js");

const app = express();

app.use(cors());
app.use(express.json());

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

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

module.exports = app;
