import winston from "winston";
import transports from "./transports";

const { combine, json, timestamp, errors } = winston.format;
// configure logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json(), errors({ stack: true })),
  defaultMeta: {
    logger_name: "main_logger",
  },
  transports,
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});
