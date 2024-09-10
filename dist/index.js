"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const dirname = path_1.default.resolve();
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// set pug as the view engine
app.set("views", path_1.default.join(dirname, "src", "views"));
app.set("view engine", "pug");
app.get("/bot/jobs", (req, res) => {
    // get all career pages from db
    // create a .jsonl file containing all requests
    res.send("TODO: Send request to batch api.");
});
app.get("/bot/batchResponse", (req, res) => {
    res.send("TODO: Check for batch response.");
});
app.listen(port, () => {
    console.log(`[server]: Server is farting at http://localhost:${port}`);
});
