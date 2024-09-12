"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const openai_1 = __importDefault(require("./openai"));
const path = "./src/requests/requests.jsonl";
const fileWriterAPI = {
    writeOpenaiRequestsToJsonlFIle(htmlArray, companies) {
        for (let i = 0; i < htmlArray.length; i++) {
            const jsonString = openai_1.default.createOpenaiRequestString(htmlArray[i], companies[i].id);
            try {
                (0, fs_1.writeFileSync)(path, jsonString);
            }
            catch (error) {
                console.log("There was an error writing the request for " +
                    companies[i].name +
                    ".", error);
            }
        }
        console.log("done writing to json file");
    },
};
exports.default = fileWriterAPI;
