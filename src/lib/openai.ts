import OpenAI from "openai";
import fs from "fs";
const openai = new OpenAI();
const openai_model = "gpt-4o-mini";

const openaiAPI = {
  async createBatchRequest(file_id: string) {
    return await openai.batches.create({
      input_file_id: file_id,
      endpoint: "/v1/chat/completions",
      completion_window: "24h",
    });
  },

  async uploadJsonlFile() {
    return await openai.files.create({
      file: fs.createReadStream("./src/requests/requests.jsonl"),
      purpose: "batch",
    });
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
              "You will receive a string of html from a job board. Respond with the job titles listed in the html.",
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
