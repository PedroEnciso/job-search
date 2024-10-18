import { Request, Response } from "express";
import {
  checkIfCompanyExists,
  createNewCompany,
  createNewUserCompany,
  getUserCompanies,
} from "../db/queries";
import { check } from "express-validator";
import { Supabase_User_Request } from "../middleware/checkForUser";

async function get_companies(req: Request, res: Response) {
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

async function get_new_company(req: Request, res: Response) {
  if (req.headers["hx-target"]) {
    res.render("companies/new_company_form");
  } else {
    res.render("index", {
      page: "companies",
      content: "new company",
    });
  }
}

async function post_new_company(req: Request, res: Response) {
  try {
    // make sure user is logged in
    const { user_id } = req.supabase_user as Supabase_User_Request;
    let error: string | null = null;
    // get the name and title of the new company from the request
    const { company_name, company_url } = await validateNewCompanyRequest(req);
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
  } catch (error) {
    // render error
    res.render("index", {
      page: "companies",
      content: "new company",
      error,
    });
  }
}

export default { get_companies, get_new_company, post_new_company };

// validation functions
async function validateNewCompanyRequest(req: Request) {
  // validate and sanitize company_name
  const name_result = await check("company_name")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Company name field is invalid")
    .run(req);
  // check for errors
  if (!name_result.isEmpty()) {
    throw new Error(name_result.context.errors[0].msg);
  }
  // validate and sanitize company_url
  const url_result = await check("company_url")
    .trim()
    .notEmpty()
    .isURL()
    .withMessage("Career page URL field is invalid")
    .run(req);
  // check for errors
  if (!url_result.isEmpty()) {
    console.log(url_result);
    throw new Error(url_result.context.errors[0].msg);
  }
  // body is validated, get values as string and return
  const company_name = req.body.company_name as string;
  const company_url = req.body.company_url as string;
  return { company_name, company_url };
}
