import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { dirname } from "..";
import { getErrorMessage } from "./util";
import { logger } from "../logger";
const openai = new OpenAI();
const openai_model = "gpt-4o-mini";

const openaiAPI = {
  async createBatchRequest(file_id: string) {
    try {
      return await openai.batches.create({
        input_file_id: file_id,
        endpoint: "/v1/chat/completions",
        completion_window: "24h",
      });
    } catch (error) {
      throw new Error(getErrorMessage(error, "createBatchRequest"));
    }
  },

  async getBatchRequest(id: string) {
    try {
      return await openai.batches.retrieve(id);
    } catch (error) {
      throw new Error(getErrorMessage(error, "getBatchRequest"));
    }
  },

  async getBatchResponseFileAsArray(file_id: string) {
    try {
      const fileResponse = await openai.files.content(file_id);
      const fileContents = await fileResponse.text();
      return fileContents.split("\n");
    } catch (error) {
      throw new Error(getErrorMessage(error, "getBatchResponseFileAsArray"));
    }
  },

  async uploadJsonlFile() {
    try {
      const json_file_path = path.join(dirname, "dist", "requests.jsonl");
      if (!fs.existsSync(json_file_path)) {
        throw new Error("The json file path does not exist");
      }
      return await openai.files.create({
        file: fs.createReadStream(json_file_path),
        purpose: "batch",
      });
    } catch (error) {
      throw new Error(getErrorMessage(error, "uploadJsonlFile"));
    }
  },

  createOpenaiRequestString(html: string, job_id: number): string {
    const requestJSON = {
      custom_id: job_id.toString(),
      method: "POST",
      url: "/v1/chat/completions",
      body: {
        model: openai_model,
        messages: [
          {
            role: "system",
            content:
              "You will receive a string of html from a job board. Respond with the job titles listed in the html. Format the titles as a javascript string array. Ensure that the response is only a JavaScript array",
          },
          {
            role: "user",
            content: html,
          },
        ],
      },
    };
    return `${JSON.stringify(requestJSON)}\n`;
  },
};

export default openaiAPI;
