const fs = require("fs");
const path = require("path");

module.exports = async () => {
  if (global.__MEALNEST_MEMORY_SERVER__) await global.__MEALNEST_MEMORY_SERVER__.stop();
  const stateFile = path.join(__dirname, ".memory-server.json");
  if (fs.existsSync(stateFile)) fs.unlinkSync(stateFile);
};
