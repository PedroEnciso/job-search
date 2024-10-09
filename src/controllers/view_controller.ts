import { Request, Response, NextFunction } from "express";
import { getUserCompanies, getUserCurrentJobs } from "../db/queries";
import type { Supabase_User_Request } from "../middleware/checkForUser";
import { getUniqueCompanies } from "../lib/util";

async function get_index(req: Request, res: Response, next: NextFunction) {
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
    // filter companies based on company query param
    if (company_filter) {
      frontend_jobs = frontend_jobs.filter(
        (job) => job.company === company_filter
      );
    }

    // render frontend
    if (req.headers["hx-target"]) {
      res.render("current_jobs/current_jobs", {
        jobs: frontend_jobs,
        filter: company_filter,
        companies: unique_companies,
        sidebar: "Current openings",
        error: error_message,
      });
    } else {
      res.render("index", {
        content: "current jobs",
        jobs: frontend_jobs,
        filter: company_filter,
        companies: unique_companies,
        sidebar: "Current openings",
        error: error_message,
      });
    }
  } catch (error) {
    console.log("Error at GET /current_jobs", error);
    res.render("current_jobs", {
      jobs: [],
      sidebar: "Current openings",
      error: "There was an error fetching your jobs. Please refresh the page.",
    });
  }
}

async function get_companies(req: Request, res: Response, next: NextFunction) {
  try {
    const user_id = req.supabase_user?.user_id;
    if (!user_id) {
      res.redirect("/login");
    } else {
      const user_companies = await getUserCompanies(user_id);
      if (req.headers["hx-target"]) {
        res.render("companies/companies", {
          companies: user_companies,
          company_content: "companies",
        });
      } else {
        res.render("index", {
          content: "companies",
          sidebar: "Companies",
          companies: user_companies,
        });
      }
    }
  } catch (error) {
    console.log("error getting companies");
  }
}

async function get_new_company(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.headers["hx-target"]) {
    res.render("companies/new_company_form", { company_content: "new" });
  } else {
    console.log("help");
    res.render("index", {
      content: "companies",
      sidebar: "Companies",
      company_content: "new",
    });
  }
}

export default { get_index, get_companies, get_new_company };
