async function getJobs() {
  const data = await response.json();
  console.log(`There are ${data.total} postings.`);
  const format = data.jobPostings.map((job) => ({
    title: job.title,
    path: job.externalPath,
  }));
  console.log(format);
}

getJobs();

const playwright = require("playwright");

async function getNetworkRequests() {
  // launch chrome browser
  const browser = await playwright.chromium.launch();
  // create a new page
  const context = await browser.newContext();
  const page = await context.newPage();
  // monitor network
  page.on("request", (request) => {
    if (request.method() === "POST") {
      console.log(">>", request.method(), request.url());
    }
  });
  page.on("response", async (response) => {
    console.log(await response.json());
  });
  await page.goto("https://gn.wd3.myworkdayjobs.com/en-US/JabraCareers/");
  await browser.close();
}

// getNetworkRequests();
