import { writeFileSync } from "fs";
import openaiAPI from "./openai";
import type { Company } from "../types";

const path = "./src/requests/requests.jsonl";

const fileWriterAPI = {
  writeOpenaiRequestsToJsonlFIle(
    htmlArray: string[],
    companies: Company[]
  ): void {
    for (let i = 0; i < htmlArray.length; i++) {
      const jsonString = openaiAPI.createOpenaiRequestString(
        htmlArray[i],
        companies[i].id
      );
      try {
        writeFileSync(path, jsonString);
      } catch (error) {
        console.log(
          "There was an error writing the request for " +
            companies[i].name +
            ".",
          error
        );
      }
    }
    console.log("done writing to json file");
  },
};

export default fileWriterAPI;
