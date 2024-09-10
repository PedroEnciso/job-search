import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ipAddresses } from "./validIP";

const dirname = path.resolve();
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// set pug as the view engine
app.set("views", path.join(dirname, "src", "views"));
app.set("view engine", "pug");

app.get("/bot/jobs", (req: Request, res: Response) => {
  // validate that the user's ip is from cron-job.org
  const user_ip = req.socket.remoteAddress;
  const ip_is_valid = ipAddresses.filter((ip) => ip === user_ip).length === 1;
  // get all career pages from db
  // create a .jsonl file containing all requests
  res.send(
    `Request was sent from ${user_ip} which ${
      ip_is_valid ? "is" : "is not"
    } a valid address.`
  );
});

app.get("/bot/batchResponse", (req: Request, res: Response) => {
  res.send("TODO: Check for batch response.");
});

app.listen(port, () => {
  console.log(`[server]: Server is farting at http://localhost:${port}`);
});
