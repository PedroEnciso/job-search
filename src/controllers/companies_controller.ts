import { Request, Response } from "express";
import {
  checkIfCompanyExists,
  createNewCompany,
  createNewUserCompany,
  deleteUserCompany,
  getUserCompanies,
  getUserCompany,
  updateUserCompanyStatus,
} from "../db/queries";
import { check } from "express-validator";
import { Supabase_User_Request } from "../middleware/checkForUser";

async function get_companies(req: Request, res: Response) {
  const { user_id } = req.supabase_user as Supabase_User_Request;
  try {
    const user_companies_with_is_active = await getUserCompanies(user_id);
    if (req.headers["hx-target"]) {
      res.render("index", {
        page: "Companies",
        content: "companies",
        companies: user_companies_with_is_active,
      });
    } else {
      res.render("index", {
        page: "Companies",
        content: "companies",
        companies: user_companies_with_is_active,
      });
    }
  } catch (error) {
    console.log("error getting companies");
  }
}

async function get_new_company(req: Request, res: Response) {
  if (req.headers["hx-target"]) {
    res.render("companies/new_company");
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
    // company_is_active false if user companies equals or exceeds the count
    let company_is_active = user_companies.length < ARBITRARY_COMPANY_COUNT;
    // add the company to db
    // check if this company exists in the db already
    let company_id: number;
    const company = await checkIfCompanyExists(company_name, company_url);
    if (!company) {
      // company has not yet been added to db, add it
      const new_company = await createNewCompany(company_name, company_url);
      company_id = new_company[0].id;
    } else {
      // company does exist, get its id
      company_id = company.id;
      // Check if this user has this company already
      const user_already_created_company = await getUserCompany(
        user_id,
        company_id
      );
      if (user_already_created_company) {
        // user has created this company before, throw error
        throw new Error("You have already added this company");
      }
    }
    // add a row to user_companies
    await createNewUserCompany(user_id, company_id, company_is_active);
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

async function patch_company(req: Request, res: Response) {
  // get the user's id
  const { user_id } = req.supabase_user as Supabase_User_Request;
  // get the company id
  const { id } = req.params;
  const company_id = parseInt(id);
  // get the new status as a boolean
  const { new_status } = req.body;
  const new_is_active = new_status === "active" ? true : false;
  // update user_companies with new status
  await updateUserCompanyStatus(user_id, company_id, new_is_active);
  // return
  res.render("companies/company", {
    company: {
      id: company_id,
      name: req.body.name,
      jobs_url: req.body.url,
      is_active: new_is_active,
    },
  });
}

async function delete_company(req: Request, res: Response) {
  // get the user's id
  const { user_id } = req.supabase_user as Supabase_User_Request;
  // get the company id
  const { id } = req.params;
  // get company id as a number
  const company_id = parseInt(id);
  // ensure company_id is a number
  if (!isNaN(company_id)) {
    // company_id is a number, proceed with deleting
    await deleteUserCompany(user_id, company_id);
  }
  // get user's current companie
  const user_companies_with_is_active = await getUserCompanies(user_id);
  // render
  res.render("companies/companies", {
    companies: user_companies_with_is_active,
  });
}

export default {
  get_companies,
  get_new_company,
  post_new_company,
  patch_company,
  delete_company,
};

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
