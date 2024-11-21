import { Response, Request } from "express";
import { Supabase_User_Request } from "../../middleware/checkForUser";
import { getUserCurrentJobs } from "../../db/queries";
import { logger } from "../../logger";
import { FrontendCurrentJob } from "../../types";

async function get_current_jobs(req: Request, res: Response) {
  try {
    // get the user's id from req.supabase_user
    const { user_id } = req.supabase_user as Supabase_User_Request;
    // get users current_jobs
    const current_jobs = await getUserCurrentJobs(user_id);
    // format the jobs for the client
    let frontend_jobs: FrontendCurrentJob[] = current_jobs.map((job) => {
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
    res.json(frontend_jobs);
  } catch (error) {
    // log the specific error
    if (error instanceof Error) {
      logger.error(error.message);
    } else if (error instanceof String) {
      logger.error(error);
    } else {
      logger.error("Error in get /current_jobs");
    }
    // send generic error
    throw new Error("There was an error getting your current jobs.");
  }
}

export default {
  get_current_jobs,
};
