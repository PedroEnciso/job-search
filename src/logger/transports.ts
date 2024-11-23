import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import winston from "winston";

const logtail_token = process.env.LOGTAIL_TOKEN!;

const logtail = new Logtail(logtail_token);

const transports: winston.transport | winston.transport[] | undefined = [
  new winston.transports.Console(),
];

if (process.env.ENVIRONMENT === "PRODUCTION") {
  transports.push(new LogtailTransport(logtail));
}

export default transports;
