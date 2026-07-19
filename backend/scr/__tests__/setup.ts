const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const stateFile = path.join(__dirname, ".memory-server.json");
const { uri } = JSON.parse(fs.readFileSync(stateFile, "utf8"));
if (!/^mongodb:\/\/127\.0\.0\.1:/.test(uri) || !uri.includes("mealnest_cw2_test")) {
  throw new Error("Automated tests may only use the MealNest in-memory database");
}

process.env.NODE_ENV = "test";
process.env.MONGO_URI = uri;
process.env.JWT_SECRET = "cw2-test-only-secret";
delete process.env.EMAIL_USER;
delete process.env.EMAIL_PASS;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.host !== "127.0.0.1" || mongoose.connection.name !== "mealnest_cw2_test") {
    throw new Error("Refusing to clean a non-test database");
  }
  await Promise.all(Object.values(mongoose.connection.collections).map((collection: any) => collection.deleteMany({})));
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
});
