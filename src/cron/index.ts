import {
  getAllCompanies,
  createBatchRequest,
  getOldestPendingBatchRequest,
  updateBatchRequestStatus,
  insertManyJobs,
} from "../db/queries";
import scraperAPI from "../lib/scraper";
import fileWriterAPI from "../lib/fileWriter";
import openaiAPI from "../lib/openai";
import type { Company, BatchResponse } from "../types";

const botAPI = {
  async getJobs() {
    try {
      // get all companys
      const companies: Company[] = await getAllCompanies();
      // get all urls in a string array
      const urls: string[] = companies.map((comp) => comp.jobs_url);
      // get html of each url into an array
      const jobHtmlArray: string[] = await scraperAPI.getHtmlFromJobPages(urls);
      // write requests to a .jsonl file
      await fileWriterAPI.writeOpenaiRequestsToJsonlFIle(
        jobHtmlArray,
        companies
      );
      // upload the file to openai
      const file = await openaiAPI.uploadJsonlFile();
      // create batch request using file id
      const batch_request = await openaiAPI.createBatchRequest(file.id);
      // save batch id to db
      await createBatchRequest(batch_request.id, file.id);
      console.log("Finished getting jobs");
    } catch (error) {
      console.log("getJobs Error");
      console.error(error);
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
              const array_string =
                json_response.response.body.choices[0].message.content;
              // format the string into an JS array
              const formatted_array_string = array_string.replace(/'/g, '"');
              const job_title_array: string[] = JSON.parse(
                formatted_array_string
              );
              // return;
              // create an array of jobs from job titles
              const jobs = job_title_array.map((job) => ({
                title: job,
                found_at: db_batch_request.created_at,
                company_id: parseInt(json_response.custom_id),
              }));
              await insertManyJobs(jobs);
            }
          }
          console.log("finished creating jobs");
        } else {
          console.log("no batches are ready");
        }
      } else {
        console.log("no batches found");
      }
    } catch (error) {
      console.log("checkBatchResponse Error");
      console.error(error);
    }
  },
};

export default botAPI;
