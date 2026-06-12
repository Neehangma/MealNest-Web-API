require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8089;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ success: true, message: "MealNest Backend Running" });
});

app.listen(PORT, () => {
  console.log(`MealNest API running on http://localhost:${PORT}`);
});
