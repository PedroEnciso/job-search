import express from "express";
import type { Request, Response } from "express";
import { checkForUser } from "../middleware/checkForUser";
import { Supabase_User_Request } from "../middleware/checkForUser";
import { getUserJobs, getUserJobsWithCompanyFromToday } from "../db/queries";

export const view_router = express.Router();

view_router.get("/", checkForUser, async (req: Request, res: Response) => {
  if (req.headers["hx-target"]) {
    res.render("current jobs");
  } else {
    res.render("index", { content: "current jobs" });
  }
});

view_router.get("/login", checkForUser, async (req: Request, res: Response) => {
  if (req.headers["hx-target"]) {
    res.render("login");
  } else {
    res.render("index", { content: "login" });
  }
});

const date = new Date();

const current_jobs = [
  {
    title: "Software Engineer",
    company: "Apple",
    found_at: `${date.getMonth()}/${date.getDate()}`,
  },
  {
    title: "Application Engineer",
    company: "Vuori",
    found_at: `${date.getMonth()}/${date.getDate()}`,
  },
  {
    title: "Janitor",
    company: "RBVHS",
    found_at: `${date.getMonth()}/${date.getDate()}`,
  },
];

// get the user's jobs found from "today"
view_router.get(
  "/current_jobs",
  checkForUser,
  async (req: Request, res: Response) => {
    if (req.headers["hx-target"]) {
      try {
        // get the user's id from req.supabase_user
        const { user_id } = req.supabase_user as Supabase_User_Request;
        // fetch all user_jobs for user
        const user_jobs = await getUserJobs(user_id);
        // get all jobs from today
        const job_promise_array = user_jobs.map(async (job) => {
          return await getUserJobsWithCompanyFromToday(job.job_id);
        });

        // wait for promises to finish
        const todays_jobs = await Promise.all(job_promise_array);
        // update an error_message if there are not any jobs
        let error_message;
        if (todays_jobs.length === 0) {
          console.log("setting error message");
          error_message = "You have no current job openings.";
        }
        // return the jobs to the user, only return title, company, url and found_at
        const frontend_jobs = todays_jobs.map((job) => {
          if (!job) return false;
          const date = new Date(job.found_at);
          const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "2-digit",
          });
          return {
            title: job.title,
            company: job.company.name,
            job_url: job.company.jobs_url,
            found_at: formattedDate,
          };
        });
        // timeout
        // await new Promise((resolve: (value: null) => void) => {
        //   setTimeout(() => resolve(null), 3000);
        // });

        res.render("current_jobs", {
          jobs: frontend_jobs,
          error: error_message,
        });
      } catch (error) {
        console.log("Error at GET /current_jobs", error);
        res.render("current_jobs", {
          jobs: [],
          error:
            "There was an error fetching your jobs. Please refresh the page.",
        });
      }
    } else {
      res.render("index", { content: "current jobs" });
    }
  }
);
