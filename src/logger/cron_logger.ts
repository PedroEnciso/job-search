import winston from "winston";
import transports from "./transports";
const { combine, json, timestamp, errors } = winston.format;
// configure logger
export const cron_logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json(), errors({ stack: true })),
  defaultMeta: {
    logger_name: "cron_logger",
  },
  transports,
});
