const fs = require("fs");
const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async () => {
  const server = await MongoMemoryServer.create({ instance: { dbName: "mealnest_cw2_test" } });
  const uri = server.getUri("mealnest_cw2_test");
  if (!/^mongodb:\/\/127\.0\.0\.1:/.test(uri)) throw new Error("Refusing non-memory MongoDB test URI");
  process.env.NODE_ENV = "test";
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = "cw2-test-only-secret";
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;
  fs.writeFileSync(path.join(__dirname, ".memory-server.json"), JSON.stringify({ uri }));
  global.__MEALNEST_MEMORY_SERVER__ = server;
};
