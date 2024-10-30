import winston from "winston";
const { combine, json, timestamp } = winston.format;
// configure logger
export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({
      filename: "combined.log",
    }),
  ],
});
