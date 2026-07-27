const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/constant");
const Review = require("../models/review.model");

async function migrateReviewIndexes() {
  await Review.init();
  const indexes = await Review.collection.indexes();
  const legacyIndex = indexes.find((index) => index.name === "restaurantId_1_userId_1" && index.unique);
  if (legacyIndex) await Review.collection.dropIndex(legacyIndex.name);
}

async function connectMongo() {
  if (!MONGO_URI) {
    throw new Error("MONGODB_URI is required when NODE_ENV=production");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  await migrateReviewIndexes();
  return mongoose.connection;
}

module.exports = {
  connectMongo,
};
