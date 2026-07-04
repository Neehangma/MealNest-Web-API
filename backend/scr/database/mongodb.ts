import mongoose from "mongoose";
import { MONGO_URI } from "../config/constant";

export async function connectMongo() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URI);
  return mongoose.connection;
}
