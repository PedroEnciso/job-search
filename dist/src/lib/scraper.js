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
const playwright_1 = __importDefault(require("playwright"));
const scraperAPI = {
    getHtmlFromJobPages(job_urls) {
        return __awaiter(this, void 0, void 0, function* () {
            // launch chrome browser
            const browser = yield playwright_1.default["chromium"].launch();
            // create a new page
            const context = yield browser.newContext();
            const page = yield context.newPage();
            // go to each url
            const htmlArray = [];
            for (const url of job_urls) {
                yield page.goto(url);
                const content = yield page.content();
                // add html content to array
                htmlArray.push(content);
            }
            return htmlArray;
        });
    },
};
exports.default = scraperAPI;
