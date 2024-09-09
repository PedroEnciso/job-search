import playwright from "playwright";
import { getJobTitles } from "./openai.js";

(async () => {
  const initial = Date.now();
  const browser = await playwright["chromium"].launch();
  console.log("Browser launched", Date.now() - initial + " ms");

  const context = await browser.newContext();
  const page = await context.newPage();
  console.log("New page created", Date.now() - initial + " ms");

  await page.goto("https://job-boards.greenhouse.io/growtherapy/");
  console.log("Navigated to page", Date.now() - initial + " ms");

  const html = await page.content();
  console.log("Received content", Date.now() - initial + " ms");

  const openaiResponse = await getJobTitles(`<body${html}`);
  console.log("got jobs", Date.now() - initial + " ms");
  console.log("response", openaiResponse);

  await browser.close();
})();
