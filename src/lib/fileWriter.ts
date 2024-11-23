import fs from "fs";
import fsPromises from "fs/promises";
import openaiAPI from "./openai";
import path from "path";
import { dirname } from "..";
import type { Company } from "../types";
import { logger } from "../logger";

// const path = "./src/requests/requests.jsonl";

const fileWriterAPI = {
  async writeOpenaiRequestsToJsonlFIle(
    htmlArray: string[],
    companies: Company[]
  ): Promise<void> {
    for (let i = 0; i < htmlArray.length; i++) {
      const json_string = openaiAPI.createOpenaiRequestString(
        htmlArray[i],
        companies[i].id
      );
      try {
        // check if the file has been created
        let json_data_string = "";
        const json_file_path = path.join(dirname, "dist", "requests.jsonl");
        if (fs.existsSync(json_file_path)) {
          // file has been created, add to json_data_string
          json_data_string = await fsPromises.readFile(json_file_path, "utf8");
        }
        // consolidate data from file and passed in data
        const all_data = json_data_string.concat(json_string);
        // write consolidated data to the file
        await fsPromises.writeFile(json_file_path, all_data);
      } catch (error) {
        logger.error(
          "There was an error writing the request for " + companies[i].name
        );
        logger.error(error);
      }
    }
  },

  async deleteRequestFile() {
    try {
      const json_file_path = path.join(dirname, "dist", "requests.jsonl");
      await fsPromises.writeFile(json_file_path, "");
    } catch (error) {
      console.error(`Error clearing file: ${error}`);
    }
  },
};

export default fileWriterAPI;
