process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "mealnest-e2e-only-secret";

require("tsx/cjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function main() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const emailService = require("../services/emailService");
  emailService.sendBookingConfirmationEmail = async () => ({ messageId: "e2e-email-suppressed" });
  const User = require("../models/user.model");
  const Restaurant = require("../models/restaurant.model");
  await User.create({ fullName: "E2E Admin", email: "e2e-admin@example.com", phoneNumber: "9800000000", password: await bcrypt.hash("TestPassword123", 4), role: "admin" });
  await Restaurant.create({ name: "E2E Trattoria", cuisine: "Italian", location: "Kathmandu", address: "E2E Test Street", phone: "9800000000", description: "Disposable Playwright restaurant", price: 450, image: "/images/tavola.jpg" });
  const app = require("../server");
  const server = app.listen(18088, "127.0.0.1", () => console.log("E2E backend ready on http://127.0.0.1:18088"));
  const close = async () => { await new Promise((resolve) => server.close(resolve)); await mongoose.disconnect(); await mongo.stop(); process.exit(0); };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

main().catch((error) => { console.error(error); process.exit(1); });
