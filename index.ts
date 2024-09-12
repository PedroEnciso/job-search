import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ipAddresses } from "./src/validIP";
import { getCompanyUrls, createBatchRequest } from "./src/db/queries";
import scraperAPI from "./src/lib/scraper";
import fileWriterAPI from "./src/lib/fileWriter";
import openaiAPI from "./src/lib/openai";

import type { Company } from "./src/types";

const dirname = path.resolve();
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// set pug as the view engine
app.set("views", path.join(dirname, "src", "views"));
app.set("view engine", "pug");

app.get("/bot/jobs", async (req: Request, res: Response) => {
  const initialTime = Date.now();
  // validate that the user's ip is from cron-job.org
  const user_ip = req.socket.remoteAddress;
  const ip_is_valid = ipAddresses.filter((ip) => ip === user_ip).length === 1;
  // IIFE to return response immediately
  (async () => {
    // get all companys
    const companies: Company[] = await getCompanyUrls();
    // get all urls in a string array
    const urls: string[] = companies.map((comp) => comp.jobs_url);
    // get html of each url into an array
    const jobHtmlArray: string[] = await scraperAPI.getHtmlFromJobPages(urls);
    // write requests to a .jsonl file
    fileWriterAPI.writeOpenaiRequestsToJsonlFIle(jobHtmlArray, companies);
    // upload the file to openai
    const file = await openaiAPI.uploadJsonlFile();
    // create batch request using file id
    const batch_request = await openaiAPI.createBatchRequest(file.id);
    // save batch id to db
    await createBatchRequest(batch_request.id);
  })();

  res.send(
    `Request was sent from ${user_ip} which ${
      ip_is_valid ? "is" : "is not"
    } a valid address.`
  );
});

app.get("/bot/batchResponse", (req: Request, res: Response) => {
  res.send("TODO: Check for batch response.");
});

app.get("/bot/jobs/responses", async (req: Request, res: Response) => {
  const cron_url = "https://api.cron-job.org/";
  const job_id = "5368200";
  // get cron job history
  const response = await fetch(`${cron_url}jobs/${job_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.log("there was an error");
  }

  console.log("data", data);

  res.send("Fin");
});

app.listen(port, () => {
  console.log(`[server]: Server is farting at http://localhost:${port}`);
});
