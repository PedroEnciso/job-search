import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { botRouter } from "./routes";

const dirname = path.resolve();
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// set pug as the view engine
app.set("views", path.join(dirname, "src", "views"));
app.set("view engine", "pug");

// use routers
app.use("/bot", botRouter);

app.listen(port, () => {
  console.log(`[server]: Server is farting at http://localhost:${port}`);
});
