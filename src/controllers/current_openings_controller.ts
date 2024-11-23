import { Response, Request } from "express";
import { Supabase_User_Request } from "../middleware/checkForUser";
import { getUserCurrentJobs } from "../db/queries";
import { getUniqueCompanies } from "../lib/util";
import { logger } from "../logger";

async function get_current_openings(req: Request, res: Response) {
  logger.info("get_current_jobs");
  let company_filter = (req.query.company as string) || "";
  try {
    // get the user's id from req.supabase_user
    const { user_id } = req.supabase_user as Supabase_User_Request;
    // get users current_jobs
    const current_jobs = await getUserCurrentJobs(user_id);
    // update an error_message if there are not any jobs
    let error_message = "";
    if (current_jobs.length === 0) {
      error_message = "You have no current job openings.";
    }
    // format the jobs for the client
    let frontend_jobs = current_jobs.map((job) => {
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
    // get companies
    const unique_companies = getUniqueCompanies(frontend_jobs);
    // filter companies based on company query param and render
    if (company_filter) {
      frontend_jobs = frontend_jobs.filter(
        (job) => job.company === company_filter
      );
    }

    // render frontend
    if (req.headers["hx-target"]) {
      res.render("index", {
        page: "Current openings",
        content: "current jobs",
        jobs: frontend_jobs,
        filter: company_filter,
        companies: unique_companies,
        error: error_message,
      });
    } else {
      res.render("index", {
        page: "Current openings",
        content: "current jobs",
        jobs: frontend_jobs,
        filter: company_filter,
        companies: unique_companies,
        error: error_message,
      });
    }
  } catch (error) {
    logger.error(error);
    res.render("current_jobs", {
      jobs: [],
      sidebar: "Current openings",
      error: "There was an error fetching your jobs. Please refresh the page.",
    });
  }
}

export default {
  get_current_openings,
};
