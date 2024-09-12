"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const validIP_1 = require("./validIP");
const queries_1 = require("./db/queries");
const scraper_1 = __importDefault(require("./lib/scraper"));
const fileWriter_1 = __importDefault(require("./lib/fileWriter"));
const openai_1 = __importDefault(require("./lib/openai"));
const dirname = path_1.default.resolve();
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// set pug as the view engine
app.set("views", path_1.default.join(dirname, "src", "views"));
app.set("view engine", "pug");
app.get("/bot/jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const initialTime = Date.now();
    // validate that the user's ip is from cron-job.org
    const user_ip = req.socket.remoteAddress;
    const ip_is_valid = validIP_1.ipAddresses.filter((ip) => ip === user_ip).length === 1;
    // IIFE to return response immediately
    (() => __awaiter(void 0, void 0, void 0, function* () {
        // get all companys
        const companies = yield (0, queries_1.getCompanyUrls)();
        // get all urls in a string array
        const urls = companies.map((comp) => comp.jobs_url);
        // get html of each url into an array
        const jobHtmlArray = yield scraper_1.default.getHtmlFromJobPages(urls);
        // write requests to a .jsonl file
        fileWriter_1.default.writeOpenaiRequestsToJsonlFIle(jobHtmlArray, companies);
        // upload the file to openai
        const file = yield openai_1.default.uploadJsonlFile();
        // create batch request using file id
        const batch_request = yield openai_1.default.createBatchRequest(file.id);
        // save batch id to db
        yield (0, queries_1.createBatchRequest)(batch_request.id);
    }))();
    res.send(`Request was sent from ${user_ip} which ${ip_is_valid ? "is" : "is not"} a valid address.`);
}));
app.get("/bot/batchResponse", (req, res) => {
    res.send("TODO: Check for batch response.");
});
app.get("/bot/jobs/responses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cron_url = "https://api.cron-job.org/";
    const job_id = "5368200";
    // get cron job history
    const response = yield fetch(`${cron_url}jobs/${job_id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
        },
    });
    const data = yield response.json();
    if (!response.ok) {
        console.log("there was an error");
    }
    console.log("data", data);
    res.send("Fin");
}));
app.listen(port, () => {
    console.log(`[server]: Server is farting at http://localhost:${port}`);
});
