const path = require("path");
const winston = require("winston");

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const LOG_DIR = path.join(__dirname, "..", "logs");

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaText = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : "";

    return `${timestamp} ${level}: ${message}${metaText}${stack ? `\n${stack}` : ""}`;
  })
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      format: fileFormat
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      format: fileFormat
    })
  ]
});

module.exports = logger;
