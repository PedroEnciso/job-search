import express, { Request, Response } from "express";
import {
  getCompanyUrls,
  createBatchRequest,
  getOldestPendingBatchRequest,
  updateBatchRequestStatus,
} from "../db/queries";
import scraperAPI from "../lib/scraper";
import fileWriterAPI from "../lib/fileWriter";
import openaiAPI from "../lib/openai";
import type { Company } from "../types";

export const botRouter = express.Router();

botRouter.get("/jobs", async (req: Request, res: Response) => {
  // validate that the request contains the auth code
  const auth_code = req.headers.Auth;
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
    await createBatchRequest(batch_request.id, file.id);
  })();

  res.send(`Request cantained auth code: ${auth_code}`);
});

botRouter.get("/batchResponse", async (req: Request, res: Response) => {
  // IIFE to return response immediately
  (async () => {
    // get the oldest batch request where status is not equal to failed, canceled, expired or completed
    const db_batch_request_array = await getOldestPendingBatchRequest();
    // ensure that a request was found
    if (db_batch_request_array.length > 0) {
      const db_batch_request = db_batch_request_array[0];
      // fetch the batch request from openai
      const batch_request = await openaiAPI.getBatchRequest(
        db_batch_request.id
      );
      // check if the status has changed
      if (batch_request.status !== db_batch_request.status) {
        // update the status in the db
        await updateBatchRequestStatus(batch_request.id, batch_request.status);
        console.log(`updated status of batch ${batch_request.id}`);
      }
      // check if the status is completed and if output file is available
      if (
        batch_request.status === "completed" &&
        batch_request.output_file_id
      ) {
        // fetch the file response from openai
        const response_array = await openaiAPI.getBatchResponseFileAsArray(
          batch_request.output_file_id
        );
        console.log("I received an array", response_array);

        // TODO: logic for retreiving fileContents and writing to db
      } else {
        console.log("no batches are ready");
      }
    } else {
      console.log("no batches found");
    }
  })();
  res.send("TODO: Check for batch response.");
});

botRouter.get("/jobs/responses", async (req: Request, res: Response) => {
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
