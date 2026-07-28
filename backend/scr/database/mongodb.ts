const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/constant");
const { migrateReviewIndexes } = require("./migrations/review-indexes");

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
