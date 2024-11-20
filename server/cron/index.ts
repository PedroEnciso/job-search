import {
  getAllCompanies,
  createBatchRequest,
  getOldestPendingBatchRequest,
  updateBatchRequestStatus,
  insertManyJobs,
  updateBatchRequestTokens,
  getYoungestCompletedBatchRequest,
  getLatestMatchRecord,
  getUsers,
  getUserCompanies,
  getUserKeywords,
  getUserCurrentJobs,
  getCompanyJobsFromToday,
  createUserJob,
  createMatchRecord,
  deleteAllCurrentJobs,
  bulkAddCurrentJobs,
  getActiveUserCompanies,
} from "../db/queries";
import scraperAPI from "../lib/scraper";
import fileWriterAPI from "../lib/fileWriter";
import openaiAPI from "../lib/openai";
import type { Company, BatchResponse, NewCurrentJob } from "../types";
import { dateIsToday } from "../lib/util";
import { logger } from "../logger";
import { sendNewJobEmail } from "../lib/mailgun";
import type { SelectCompany } from "../db/schema";

const botAPI = {
  test() {
    logger.info("Running test");
  },

  async getJobs() {
    logger.info("Running getJobs");
    try {
      // get all companys
      const companies: SelectCompany[] = await getAllCompanies();
      // get all urls in a string array
      const urls: string[] = companies.map((comp) => {
        // return alternate url instead of jobs_url if it exists
        // alternate url is used if there is an iframe in the main jobs page
        if (comp.alternate_url) {
          return comp.alternate_url;
        }
        return comp.jobs_url;
      });
      // get html of each url into an array
      const jobHtmlArray: string[] = await scraperAPI.getHtmlFromJobPages(urls);
      // write requests to a .jsonl file
      await fileWriterAPI.writeOpenaiRequestsToJsonlFIle(
        jobHtmlArray,
        companies
      );
      // upload the file to openai
      const file = await openaiAPI.uploadJsonlFile();
      // delete the requests.jsonl file
      await fileWriterAPI.deleteRequestFile();
      // create batch request using file id
      const batch_request = await openaiAPI.createBatchRequest(file.id);
      // save batch id to db
      await createBatchRequest(batch_request.id, file.id);
      logger.info("Finished running getJobs");
    } catch (error) {
      logger.error(`Error getting jobs: ${error}`);
    }
  },

  async checkBatchResponse() {
    try {
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
        }
        // check if the status is completed and if output file is available
        if (
          batch_request.status === "completed" &&
          batch_request.output_file_id
        ) {
          logger.info("Found a completed batch response");
          // fetch the file response from openai as an array of responses
          const response_array = await openaiAPI.getBatchResponseFileAsArray(
            batch_request.output_file_id
          );
          // variable to keep track of total tokens in all responses
          let total_tokens = 0;
          // loop through each response
          for (const response of response_array) {
            if (response === "") break;
            // get response as JSON
            const json_response: BatchResponse = JSON.parse(response);
            // check if there is an error in the response
            if (json_response.error) {
              // log the error, I'm unsure of its structure
              logger.error(
                `There was an error with the response for job #${json_response.custom_id}: ${json_response.error}`
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
              } else {
                // warn that no jobs were found
                logger.warning(
                  `No jobs found, company_id: ${json_response.custom_id}`
                );
              }
              // add tokens from response to total_tokens
              total_tokens =
                total_tokens + json_response.response.body.usage.total_tokens;
            }
          }
          // Finished looping through responses and creating jobs
          logger.info("finished creating jobs");
          // update batchResponse with total_tokens if they are greater than 0
          if (total_tokens > 0) {
            await updateBatchRequestTokens(db_batch_request.id, total_tokens);
            logger.info(`Request used ${total_tokens} tokens`);
          }
        }
      }
    } catch (error) {
      logger.error(
        `There was an error while checking for a batch response: ${error}`
      );
    }
  },

  async checkJobMatches() {
    try {
      // get the youngest completed batch request
      const response_array = await getYoungestCompletedBatchRequest();
      const youngest_completed_request = response_array[0];
      // check if updated_at is today in PST
      if (dateIsToday(youngest_completed_request.created_at)) {
        // get the latest match record
        const match_response_array = await getLatestMatchRecord();
        const latest_match_record = match_response_array[0];
        // check if there is a match record from today. Proceed if it is not from today
        if (
          !latest_match_record ||
          !dateIsToday(latest_match_record.created_at)
        ) {
          logger.info("Checking for job matches");
          // array that holds all jobs to be add to current jobs
          const jobs_for_current_jobs: NewCurrentJob[] = [];
          // get users from database
          const users = await getUsers();
          // for each user, get their companies and keywords
          for (const user of users) {
            const user_companies = await getActiveUserCompanies(user.id);
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
                  if (job.title.toLowerCase().includes(phrase.phrase)) {
                    // add that job title to user_jobs
                    await createUserJob(user.id, job.id);
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
                      sendNewJobEmail(
                        job.title,
                        company.name,
                        user.name,
                        user.email
                      );
                      logger.info(
                        `Sent email to customer. Job: ${job.title}, customer: ${user.id}`
                      );
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
          // add all jobs in jobs_for_current_jobs if there are any jobs to add
          if (jobs_for_current_jobs.length > 0) {
            await bulkAddCurrentJobs(jobs_for_current_jobs);
          }
        } else {
          logger.info("Latest match record is from today");
          logger.info(
            `Latest match record was created at: ${latest_match_record.created_at}`
          );
        }
      } else {
        logger.info("youngest completed batch request not from today");
        logger.info(
          `It was created at: ${youngest_completed_request.created_at}`
        );
      }
    } catch (error) {
      logger.error(`There was an error while checking for matches: ${error}`);
    }
  },
};

export default botAPI;
