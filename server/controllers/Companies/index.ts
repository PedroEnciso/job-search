import { NextFunction, Request, Response } from "express";
import {
  checkIfCompanyExists,
  createNewCompany,
  createNewPaginatedCompany,
  createNewUserCompany,
  deleteUserCompany,
  getUserCompanies,
  getUserCompany,
  getUserPaginatedCompanies,
  updateUserCompanyStatus,
} from "../../db/queries";
import { check } from "express-validator";
import { Supabase_User_Request } from "../../middleware/checkForUser";
import { logger } from "../../logger";
import { Company } from "../../types";

async function get_companies(req: Request, res: Response, next: NextFunction) {
  const { user_id } = req.supabase_user as Supabase_User_Request;
  try {
    // get user_companies
    const user_companies_with_is_active = await getUserCompanies(user_id);
    // get all paginated_companies
    // const paginated_companies = await getUserPaginatedCompanies(user_id);
    res.json(user_companies_with_is_active);
  } catch (error) {
    // log the specific error
    if (error instanceof Error) {
      logger.error(error.message);
    } else if (error instanceof String) {
      logger.error(error);
    } else {
      logger.error("Error in GET /companies");
    }
    // send generic error
    throw new Error("There was an error finding your companies.");
  }
}

async function post_new_company(req: Request, res: Response) {
  try {
    // make sure user is logged in
    const { user_id } = req.supabase_user as Supabase_User_Request;
    // get the name and title of the new company from the request
    const { company_name, company_url, paginated } =
      await validateNewCompanyRequest(req);
    // check to make sure the user does not have more than 5 companies listed
    const user_companies = await getUserCompanies(user_id);
    // THIS IS WHERE THE USER'S SUBSCRIPTION WILL BE CHECKED
    const ARBITRARY_COMPANY_COUNT = 3;
    // company_is_active false if user companies equals or exceeds the count
    let company_is_active = user_companies.length < ARBITRARY_COMPANY_COUNT;
    // add the company to db
    // check if this company exists in the db already
    let company_id: number;
    let new_company: Company;
    const company = await checkIfCompanyExists(company_name, company_url);
    if (!company) {
      // TODO: handle paginated company
      // company has not yet been added to db, add it
      const created_company = await createNewCompany(company_name, company_url);
      company_id = created_company[0].id;
      // set variable that will be returned to user
      new_company = created_company[0];
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
      // set variable that will be returned to user
      new_company = company;
    }
    if (!paginated) {
      // only add new user company row if not paginated
      await createNewUserCompany(user_id, company_id, company_is_active);
    }
    // return the company
    res.status(201).json(new_company);
  } catch (error) {
    // log the specific error
    if (error instanceof Error) {
      logger.error(error.message);
    } else if (error instanceof String) {
      logger.error(error);
    } else {
      logger.error("Error in POST /companies");
    }
    // send generic error
    throw new Error("There was an error creating this company.");
  }
}

async function patch_company(req: Request, res: Response) {
  try {
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
    // return the updated resource
    res.status(200).json({
      id: company_id,
      name: req.body.name,
      jobs_url: req.body.url,
      is_active: new_is_active,
    });
  } catch (error) {
    // log the specific error
    if (error instanceof Error) {
      logger.error(error.message);
    } else if (error instanceof String) {
      logger.error(error);
    } else {
      logger.error("Error in PATCH /companies");
    }
    // send generic error
    throw new Error("There was an error updating this company.");
  }
}

async function delete_company(req: Request, res: Response) {
  try {
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
    // render
    res.status(200).send();
  } catch (error) {
    // log the specific error
    if (error instanceof Error) {
      logger.error(error.message);
    } else if (error instanceof String) {
      logger.error(error);
    } else {
      logger.error("Error in DELETE /companies");
    }
    // send generic error
    throw new Error("There was an error deleting this company.");
  }
}

export default {
  get_companies,
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
  // validate and sanitize paginated
  const paginated_result = await check("paginated")
    .notEmpty()
    .escape()
    .withMessage("Paginated field is invalid.")
    .run(req);
  // check for errors
  if (!paginated_result.isEmpty()) {
    console.log(paginated_result);
    throw new Error(paginated_result.context.errors[0].msg);
  }

  // body is validated, get values as string and return
  const company_name = req.body.company_name as string;
  const company_url = req.body.company_url as string;
  const paginated_response = req.body.paginated as string;
  let paginated = false;
  if (paginated_response === "true") paginated = true;
  return { company_name, company_url, paginated };
}
