import express, { Request, Response } from "express";
import {
  getOldestPendingBatchRequest,
  updateBatchRequestStatus,
  insertManyJobs,
  getYoungestCompletedBatchRequest,
  getLatestMatchRecord,
  getUsers,
  getUserCompanies,
  getCompanyJobsFromToday,
  createUserJob,
  getUserKeywords,
  createMatchRecord,
  getPreviousUserJobMatch,
  getUserCurrentJobs,
  deleteAllCurrentJobs,
  bulkAddCurrentJobs,
} from "../db/queries";
import openaiAPI from "../lib/openai";
import type { BatchResponse, Job, NewCurrentJob } from "../types";
import { dateIsTodayPST, containsJobWithin48Hours } from "../lib/util";

// create router
export const botRouter = express.Router();

// checks for completed batch requests, adds the responses to db
botRouter.get("/batchResponse", async (req: Request, res: Response) => {
  // IIFE to return response immediately
  let is_authorized = true;
  if (process.env.ENVIRONMENT === "PRODUCTION") {
    // in prod, check if the auth header is correct:
    is_authorized =
      req.headers.auth === process.env.CRON_AUTH_KEY ? true : false;
  }

  (async () => {
    try {
      // abort if not authorized
      if (!is_authorized) return;
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
          await updateBatchRequestStatus(
            batch_request.id,
            batch_request.status
          );
          console.log(`updated status of batch ${batch_request.id}`);
        }
        // check if the status is completed and if output file is available
        if (
          batch_request.status === "completed" &&
          batch_request.output_file_id
        ) {
          // fetch the file response from openai as an array of responses
          const response_array = await openaiAPI.getBatchResponseFileAsArray(
            batch_request.output_file_id
          );
          // loop through each response
          for (const response of response_array) {
            if (response === "") break;
            // get response as JSON
            console.log("Parsing response");
            const json_response: BatchResponse = JSON.parse(response);
            // check if there is an error in the response
            if (json_response.error) {
              // log the error, I'm unsure of its structure
              console.log(
                `There was an error with the response for job #${json_response.custom_id}:`,
                json_response.error
              );
            } else {
              // no error, create jobs for each job title in response array
              // format the string into an JS array
              const array_string =
                json_response.response.body.choices[0].message.content;
              // split by opening bracket
              const string_partial = array_string.split("[");
              // split by closing bracket
              const string_partial_2 = string_partial[1].split("]");
              // get the data in the middle
              const string_data = string_partial_2[0];
              const job_title_array: string[] = JSON.parse(`[${string_data}]`);
              // create an array of jobs from job titles
              const jobs = job_title_array.map((job) => ({
                title: job,
                found_at: db_batch_request.created_at,
                company_id: parseInt(json_response.custom_id),
              }));
              // ensure that there are jobs to add
              if (jobs.length > 0) {
                await insertManyJobs(jobs);
              }
            }
          }
          console.log("finished creating jobs");
        } else {
          console.log("no batches are ready");
        }
      }
    } catch (error) {
      console.log("checkBatchResponse Error");
      console.error(error);
    }
  })();

  if (is_authorized) {
    res.send("Checking for batch response.");
  } else {
    res.status(401).send("UNAUTHORIZED");
  }
});

botRouter.get("/matches", (req: Request, res: Response) => {
  (async () => {
    // Determine if matches need to be made:
    try {
      // get the youngest completed batch request
      const response_array = await getYoungestCompletedBatchRequest();
      const youngest_completed_request = response_array[0];
      // check if updated_at is today in PST
      if (dateIsTodayPST(youngest_completed_request.created_at)) {
        // get the latest match record
        const match_response_array = await getLatestMatchRecord();
        const latest_match_record = match_response_array[0];
        // check if there is a match record from today. Proceed if it is not from today
        if (!dateIsTodayPST(latest_match_record.created_at)) {
          // array that holds all jobs to be add to current jobs
          const jobs_for_current_jobs: NewCurrentJob[] = [];
          // get users from database
          const users = await getUsers();
          // for each user, get their companies and keywords
          for (const user of users) {
            const user_companies = await getUserCompanies(user.id);
            const user_keywords = await getUserKeywords(user.id);
            // get users current jobs
            const users_current_jobs = await getUserCurrentJobs(user.id);
            for (const company of user_companies) {
              // for each company, get their job titles
              const company_jobs = await getCompanyJobsFromToday(company.id);
              // check if the job title includes a key word
              for (const job of company_jobs) {
                // loop through each keyword phrase
                for (const phrase of user_keywords) {
                  if (job.title.toLowerCase().includes(phrase)) {
                    // add that job title to user_jobs
                    await createUserJob(user.id, job.id);
                    console.log(
                      `{user: ${user.name}, job: ${job.title}, keyword: ${phrase}}`
                    );
                    //check to see if an email should be sent
                    // check if job exists in users_current_jobs
                    const current_job = users_current_jobs.filter(
                      (curr_job) => {
                        if (
                          curr_job.company_id === company.id &&
                          curr_job.title === job.title
                        ) {
                          // job only exists in current job if job title and company id are the same
                          return true;
                        } else {
                          return false;
                        }
                      }
                    );
                    if (current_job.length > 0) {
                      // adding the job to Holder with current job's found_at value
                      jobs_for_current_jobs.push({
                        title: job.title,
                        company_id: company.id,
                        user_id: user.id,
                        found_at: current_job[0].found_at,
                      });
                    } else {
                      // job is new, send an email
                      console.log("TODO: Send email to customer");
                      // add the job to holder
                      jobs_for_current_jobs.push({
                        title: job.title,
                        company_id: company.id,
                        user_id: user.id,
                        found_at: job.found_at,
                      });
                    }
                  }
                }
              }
            }
          }
          // create a new match record
          await createMatchRecord();
          // erase all current_jobs
          await deleteAllCurrentJobs();
          // add all jobs in jobs_for_current_jobs
          await bulkAddCurrentJobs(jobs_for_current_jobs);
        } else {
          console.log("Matches have been made today");
        }
      }
    } catch (error) {
      console.log("Error in get matches");
      console.error(error);
    }
  })();
  res.send("Checking for matches");
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
