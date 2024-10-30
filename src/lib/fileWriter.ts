import fs from "fs";
import fsPromises from "fs/promises";
import openaiAPI from "./openai";
import path from "path";
import { dirname } from "..";
import type { Company } from "../types";

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
        // const data = await fs_promise.readFile(path, { encoding: "utf8" });

        // check if the file has been created
        let json_data_string = "";
        const json_file_path = path.join(dirname, "dist", "requests.jsonl");
        if (fs.existsSync(json_file_path)) {
          // file has been created, add to json_data_string
          // json_data_string = fs.readFileSync(json_file_path, "utf8");
          json_data_string = await fsPromises.readFile(json_file_path, "utf8");
        }
        const all_data = json_data_string.concat(json_string);
        // fs.writeFileSync();
        await fsPromises.writeFile(json_file_path, all_data);

        // const json_data = file.fs.readFile(
        //   "results.json",
        //   function (err, data) {
        //     var json = JSON.parse(data);
        //     json.push("search result: " + currentSearchResult);

        //     fs.writeFile("results.json", JSON.stringify(json));
        //   }
        // );
      } catch (error) {
        console.log(
          "There was an error writing the request for " +
            companies[i].name +
            ".",
          error
        );
      }
    }
  },
};

export default fileWriterAPI;
