import express, { Request, Response } from "express";
import botAPI from "../cron";

// create router
export const botRouter = express.Router();

botRouter.get("/jobs", async (req: Request, res: Response) => {
  botAPI.getJobs();
  res.send("finished");
});

// checks for completed batch requests, adds the responses to db
botRouter.get("/batch_response", async (req: Request, res: Response) => {
  botAPI.checkBatchResponse();
  res.send("finished");
});

botRouter.get("/matches", async (req: Request, res: Response) => {
  botAPI.checkJobMatches();
  res.send("finished");
});

import { sendNewJobEmail } from "../lib/mailgun";
botRouter.get("/email", async (req: Request, res: Response) => {
  sendNewJobEmail(
    "Full stac developer",
    "Google",
    "Pete",
    "ped.enciso@gmail.com"
  );
  res.send("finished");
});
