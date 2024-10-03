import express from "express";
import type { Request, Response } from "express";
import { checkForUser } from "../middleware/checkForUser";
import { Supabase_User_Request } from "../middleware/checkForUser";
import {
  getUserCurrentJobs,
  getUserJobs,
  getUserJobsWithCompanyFromToday,
} from "../db/queries";

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

// get the user's jobs found from "today"
view_router.get(
  "/current_jobs",
  checkForUser,
  async (req: Request, res: Response) => {
    if (req.headers["hx-target"]) {
      try {
        // get the user's id from req.supabase_user
        const { user_id } = req.supabase_user as Supabase_User_Request;
        // get users current_jobs
        const current_jobs = await getUserCurrentJobs(user_id);
        // update an error_message if there are not any jobs
        let error_message;
        if (current_jobs.length === 0) {
          console.log("setting error message");
          error_message = "You have no current job openings.";
        }
        // format the jobs for the client
        const frontend_jobs = current_jobs.map((job) => {
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
        // render frontend
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
