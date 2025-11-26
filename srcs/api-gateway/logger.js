const fs = require("fs");
const path = require("path");

const logDir =
  process.env.API_GATEWAY_LOG_DIR || path.join(__dirname, "logs");
const logFile = path.join(logDir, "gateway.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const stream = fs.createWriteStream(logFile, { flags: "a" });

const write = (level, message) => {
  const line = `[${new Date().toISOString()}] [${level}] ${message}\n`;
  stream.write(line);
  console[level === "error" ? "error" : "log"](line.trim());
};

const logger = {
  info(msg) {
    write("info", msg);
  },
  error(msg) {
    write("error", msg);
  },
};

process.on("SIGINT", () => {
  stream.end(() => process.exit(0));
});

process.on("SIGTERM", () => {
  stream.end(() => process.exit(0));
});

module.exports = logger;

