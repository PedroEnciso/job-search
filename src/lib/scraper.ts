import playwright from "playwright";
import { getErrorMessage } from "./util";

const scraperAPI = {
  async getHtmlFromJobPages(job_urls: string[]): Promise<string[]> {
    try {
      // launch chrome browser
      const browser = await playwright.chromium.launch();
      // create a new page
      const context = await browser.newContext();
      const page = await context.newPage();
      // go to each url
      const htmlArray: string[] = [];
      for (const url of job_urls) {
        await page.goto(url);
        const content = await page.content();
        // add html content to array
        htmlArray.push(content);
      }
      return htmlArray;
    } catch (error) {
      throw new Error(getErrorMessage(error, "getHtmlFromJobPages"));
    }
  },
};

export default scraperAPI;
