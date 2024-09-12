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
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const openai = new openai_1.default();
const openai_model = "gpt-4o-mini";
const openaiAPI = {
    createBatchRequest(file_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield openai.batches.create({
                input_file_id: file_id,
                endpoint: "/v1/chat/completions",
                completion_window: "24h",
            });
        });
    },
    uploadJsonlFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield openai.files.create({
                file: fs_1.default.createReadStream("./src/requests/requests.jsonl"),
                purpose: "batch",
            });
        });
    },
    createOpenaiRequestString(html, job_id) {
        const requestJSON = {
            custom_id: job_id.toString(),
            method: "POST",
            url: "/v1/chat/completions",
            body: {
                model: openai_model,
                messages: [
                    {
                        role: "system",
                        content: "You will receive a string of html from a job board. Respond with the job titles listed in the html.",
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
exports.default = openaiAPI;
