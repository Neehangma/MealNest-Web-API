const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");

async function createTestUser(overrides = {}) {
  const input: any = overrides;
  return User.create({
    fullName: input.fullName || "CW2 Test User",
    email: input.email || `cw2-${Date.now()}-${Math.random()}@example.com`,
    phoneNumber: input.phoneNumber || "9800000000",
    password: await bcrypt.hash(input.password || "secret123", 4),
    role: input.role || "user",
  });
}

function tokenFor(user) {
  return jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

async function createTestRestaurant(overrides = {}) {
  const input: any = overrides;
  return Restaurant.create({
    name: input.name || "CW2 Test Trattoria",
    cuisine: input.cuisine || "Italian",
    location: input.location || "Kathmandu",
    address: input.address || "Test Street, Kathmandu",
    phone: input.phone || "+977 1-5550000",
    description: input.description || "Testing-only restaurant",
    image: input.image || "/images/tavola.jpg",
    price: input.price || 450,
    isOpen: input.isOpen ?? true,
  });
}

module.exports = { createTestRestaurant, createTestUser, tokenFor };
