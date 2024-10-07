async function getJobs() {
  const response = await fetch(
    "https://gn.wd3.myworkdayjobs.com/wday/cxs/gn/JabraCareers/jobs",
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-US",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-calypso-csrf-token": "1af4d644-dfb4-4e21-b4e1-f48031747120",
        cookie:
          "PLAY_SESSION=22eb8e225c5b7bd5100faa3e08b6185166047217-gn_pSessionId=a3nurh57krmgtg87ja8vv0271n&instance=vps-prod-bfdedu5m.prod-vps.pr501.cust.dub.wd; wday_vps_cookie=3780679946.53810.0000; __cf_bm=ALdeegm2qZxqyxD9ncrQdhKL6g.2y28Kux0D_zQ7cT0-1728082530-1.0.1.1-corKHtLP9JFKojnHjH6WoNlVYI6BZjTwf_wq.ozswZ7BiCIJAn3DNPyCotwfzcHZvJyrxAF_iBkLpVqXNVcAbw; __cflb=02DiuJFb1a2FCfph91kR4XMuWBo9zS6ftbM68Aku8HRJU; _cfuvid=t5vUEOK3ee8OLXe1S2gt5owJm.YbIk44oerVf7iCozU-1728082530176-0.0.1.1-604800000; timezoneOffset=420; wd-browser-id=5bb06a91-4ea7-476b-ba14-78f85a0d401e; CALYPSO_CSRF_TOKEN=1af4d644-dfb4-4e21-b4e1-f48031747120; enablePrivacyTracking=true",
        Referer: "https://gn.wd3.myworkdayjobs.com/en-US/JabraCareers/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: "",
      method: "POST",
    }
  );

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
