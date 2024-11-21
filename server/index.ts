import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookie_parser from "cookie-parser";
import body_parser from "body-parser";
import cron from "node-cron";
import "express-async-errors";
import botAPI from "./cron";
import { logger } from "./logger";
import { errorHandler } from "./middleware/errors";
import { Supabase_User_Request } from "./middleware/checkForUser";
import { botRouter, view_router, api_router } from "./routes";

declare global {
  namespace Express {
    interface Request {
      supabase_user?: Supabase_User_Request;
    }
  }
}

export const dirname = path.resolve();
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(cors());
app.use(cookie_parser());
app.use(body_parser.json());
app.use(
  body_parser.urlencoded({
    extended: true,
  })
);

// set pug as the view engine
app.set("views", path.join(dirname, "src", "views"));
app.set("view engine", "pug");

// api routes
app.use("/api/v1", api_router);

// add bot router in development for testing
if (process.env.ENVIRONMENT === "DEVELOPMENT") {
  app.use("/bot", botRouter);
}

// schedule cron jobs
// getJobs runs at 0:00
cron.schedule("0 0 * * *", () => botAPI.getJobs());
// check for batch responses every hour at *:00
cron.schedule("0 * * * *", () => botAPI.checkBatchResponse());
// check for job matches every hour at *:30
cron.schedule("30 * * * *", () => botAPI.checkJobMatches());

// error handler, must be last middleware
app.use(errorHandler);

app.listen(port, () => {
  logger.info("App is running");
  console.log(`[server]: Server is farting at http://localhost:${port}`);
});
