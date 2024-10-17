import { Request, Response, NextFunction } from "express";
import {
  checkIfCompanyExists,
  createNewCompany,
  createNewUserCompany,
  getUserCompanies,
  getUserCurrentJobs,
  getUserKeywords,
} from "../db/queries";
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
        res.render("index", {
          page: "Companies",
          content: "companies",
          companies: user_companies,
        });
      } else {
        res.render("index", {
          page: "Companies",
          content: "companies",
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
    res.render("companies/new_company_form");
  } else {
    res.render("index", {
      page: "companies",
      content: "new company",
    });
  }
}

async function post_new_company(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // make sure user is logged in
  const user_id = req.supabase_user?.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else {
    let error: string | null = null;
    // get the name and title of the new company from the request
    const { company_name, company_url } = validateNewCompanyRequest(req.body);
    // check to make sure the user does not have more than 5 companies listed
    const user_companies = await getUserCompanies(user_id);
    // THIS IS WHERE THE USER'S SUBSCRIPTION WILL BE CHECKED
    const ARBITRARY_COMPANY_COUNT = 5;
    const is_active = user_companies.length >= ARBITRARY_COMPANY_COUNT;
    if (user_companies.length >= ARBITRARY_COMPANY_COUNT) {
      // user has too many companies
      // idk if i will send this or just add a new company as inactive
      error =
        "Adding this company would exceed your subscription limit. This company will be added as inactive.";
    }
    // add the company to db if they have less than 5
    // check if this company exists in the db already
    let company_id: number;
    const company = await checkIfCompanyExists(company_name, company_url);
    if (!company) {
      console.log("company has not been created yet");
      // company has not yet been added to db, add it
      const new_company = await createNewCompany(company_name, company_url);
      company_id = new_company[0].id;
      console.log("new company", new_company);
    } else {
      console.log("company has been created");
      // company does exist, get its id
      company_id = company.id;
    }
    // TODO: Add a check to see if this user has this company already
    //// i could add that into the else statement above
    // add a row to user_companies
    await createNewUserCompany(user_id, company_id, is_active);
    res.redirect("/companies");
  }
}

async function get_keywords(req: Request, res: Response, next: NextFunction) {
  try {
    const user_id = req.supabase_user?.user_id;
    if (!user_id) {
      res.redirect("/login");
    } else {
      const user_keywords = await getUserKeywords(user_id);
      if (req.headers["hx-target"]) {
        res.render("index", {
          page: "Keywords",
          content: "keywords",
          keywords: user_keywords,
        });
      } else {
        res.render("index", {
          page: "Keywords",
          content: "keywords",
          keywords: user_keywords,
        });
      }
    }
  } catch (error) {
    console.log("error getting keywords");
  }
}

async function get_new_keywords(req: Request, res: Response) {
  let inputs = 1;
  if (req.query.inputs) {
    // user pressed "Add another keyword", increase input by one
    inputs = parseInt(req.query.inputs as string) + 1;
  }
  if (req.headers["hx-target"]) {
    res.render("keywords/new_keywords", { inputs });
  } else {
    res.render("index", {
      page: "Keywords",
      content: "new keywords",
      inputs: 1,
    });
  }
}

async function post_new_keywords(req: Request, res: Response) {
  console.log(req.body);
  res.send("hell yea");
}

export default {
  get_index,
  get_companies,
  get_new_company,
  post_new_company,
  get_keywords,
  get_new_keywords,
  post_new_keywords,
};

function validateNewCompanyRequest(body: NewCompanyRequest) {
  const { company_name, company_url } = body;
  if (company_name && company_url) {
    return { company_name, company_url };
  } else {
    throw new Error("Not enough information.");
  }
}

interface NewCompanyRequest {
  company_name?: string;
  company_url?: string;
}
