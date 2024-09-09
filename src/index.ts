import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

const __dirname = path.resolve();
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// set pug as the view engine
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "pug");

app.get("/bot/jobs", (req: Request, res: Response) => {
  // get all career pages from db
  // create a .jsonl file containing all requests
  res.send("TODO: Send request to batch api.");
});

app.get("/bot/batchResponse", (req: Request, res: Response) => {
  res.send("TODO: Check for batch response.");
});

app.listen(port, () => {
  console.log(`[server]: Server is farting at http://localhost:${port}`);
});
