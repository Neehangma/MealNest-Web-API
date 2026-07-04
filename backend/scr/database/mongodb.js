const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/constant.js");

async function connectMongo() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

module.exports = {
  connectMongo,
};
