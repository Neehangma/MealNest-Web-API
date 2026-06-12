import app from "./scr/server";
import { env } from "./scr/config/constant";
import { connectMongoDB } from "./scr/database/mongodb";

const startServer = async () => {
  try {
    await connectMongoDB();

    app.listen(env.port, () => {
      console.log(`MealNest API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start MealNest API", error);
    process.exit(1);
  }
};

void startServer();
