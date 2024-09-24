import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import cron from "node-cron";
import botAPI from "./cron";
import { botRouter, view_router } from "./routes";

const dirname = path.resolve();
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// set pug as the view engine
app.set("views", path.join(dirname, "src", "views"));
app.set("view engine", "pug");

// use routers
app.use("/", view_router);
app.use("/bot", botRouter);

// make public folder accessible
app.use(express.static("public"));

// schedule cron jobs in development only
if (process.env.ENVIRONMENT === "DEVELOPMENT") {
  cron.schedule("0 0 * * *", () => {
    const date = new Date();
    console.log(
      `Getting jobs at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    );
    botAPI.getJobs();
  });

  // cron.schedule("0 * * * *", () => {
  //   const date = new Date();
  //   console.log(
  //     `Checking batch response at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  //   );
  //   botAPI.checkBatchResponse();
  // });
}

app.listen(port, () => {
  console.log(`[server]: Server is farting at http://localhost:${port}`);
});
