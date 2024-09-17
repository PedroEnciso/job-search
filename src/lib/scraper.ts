import playwright_dev from "playwright";
import chromium from "@sparticuz/chromium";
import playwright_prod from "playwright-core";

const scraperAPI = {
  async getHtmlFromJobPages(job_urls: string[]): Promise<string[]> {
    // launch chrome browser
    // const browser = await playwright_dev["chromium"].launch();
    let browser;
    if (process.env.ENVIRONMENT === "DEVELOPMENT") {
      browser = await playwright_dev.chromium.launch();
    } else {
      browser = await playwright_prod.chromium.connect(
        `https://production-sfo.browserless.io/firefox/playwright?token=${process.env.BROWSERLESS_API_KEY}`
      );
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
