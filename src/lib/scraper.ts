import playwright from "playwright";
import * as cheerio from "cheerio";
import { getErrorMessage } from "./util";

const scraperAPI = {
  async getHtmlFromJobPages(job_urls: string[]): Promise<string[]> {
    try {
      // launch chrome browser
      const browser = await playwright.chromium.launch({ headless: true });
      // create a new page
      const context = await browser.newContext();
      const page = await context.newPage();
      // go to each url
      const htmlArray: string[] = [];
      for (const url of job_urls) {
        await page.goto(url);
        // scroll to the bottom of the page 10 times to account for pagination through infinite scroll
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press("End");
          await page.waitForTimeout(3000);
        }
        // get the content of the page
        const content = await page.content();
        // remove unneeded tags from html
        const cleaned_html = cleanHTML(content);
        // add html content to array
        htmlArray.push(cleaned_html);
      }
      await browser.close();
      return htmlArray;
    } catch (error) {
      throw new Error(getErrorMessage(error, "getHtmlFromJobPages"));
    }
  },
};

// strips unneeded html elements out of html_content
function cleanHTML(html_content: string): string {
  // Load the HTML content into Cheerio
  const $ = cheerio.load(html_content);
  // Remove <img>, <script>, and <style> elements
  $("img, script, style, header, footer").remove();
  // Remove the <head> section
  $("head").remove();
  // Return the cleaned HTML as a string
  return $.html();
}

export default scraperAPI;
