import mongoose from "mongoose";
import { env } from "../config/constant";

export const connectMongoDB = async () => {
  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(`MongoDB connected: ${connection.connection.host}`);

  return connection;
};
