import winston from "winston";
import morgan from "morgan";
import transports from "./transports";

const { combine, timestamp, json } = winston.format;

const winston_http_logger = winston.createLogger({
  level: "http",
  defaultMeta: {
    logger_name: "http_logger",
  },
  format: combine(timestamp(), json()),
  transports,
});

export const http_logger = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res) as string),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(
        tokens["response-time"](req, res) as string
      ),
    });
  },
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => {
        const data = JSON.parse(message);
        winston_http_logger.http(`incoming-request`, data);
      },
    },
  }
);
