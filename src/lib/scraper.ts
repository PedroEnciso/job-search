// import playwright from "playwright";
import chromium from "@sparticuz/chromium";
import playwright from "playwright-core";

const scraperAPI = {
  async getHtmlFromJobPages(job_urls: string[]): Promise<string[]> {
    // launch chrome browser
    let browser;
    if (process.env.ENVIRONMENT === "DEVELOPMENT") {
      browser = await playwright["chromium"].launch();
    } else {
      const executablePath = await chromium.executablePath();
      browser = await playwright.chromium.launch({
        executablePath,
        headless: true, // use this instead of using chromium.headless because it uses the new `headless: "new"` which will throw because playwright expects `headless: boolean`
        args: chromium.args,
      });
    }
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
  },
};

export default scraperAPI;
