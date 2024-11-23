import { Request, Response } from "express";
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
} from "../db/queries";
import { check } from "express-validator";
import { Supabase_User_Request } from "../middleware/checkForUser";
import { logger } from "../logger";

async function get_companies(req: Request, res: Response) {
  const { user_id } = req.supabase_user as Supabase_User_Request;
  try {
    // get user_companies
    const user_companies_with_is_active = await getUserCompanies(user_id);
    // get all paginated_companies
    const paginated_companies = await getUserPaginatedCompanies(user_id);
    if (req.headers["hx-target"]) {
      res.render("index", {
        page: "Companies",
        content: "companies",
        companies: user_companies_with_is_active,
        paginated_companies,
      });
    } else {
      res.render("index", {
        page: "Companies",
        content: "companies",
        companies: user_companies_with_is_active,
        paginated_companies,
      });
    }
  } catch (error) {
    logger.error(error);
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
    const company = await checkIfCompanyExists(company_name, company_url);
    if (!company) {
      // create new row in db for company
      if (paginated) {
        // create a row in paginated_companies
        await createNewPaginatedCompany(user_id, company_name, company_url);
        // set arbitrary company_id value
        company_id = 0;
        // send email to admin that a new paginated company was created
        logger.warn("A new paginated company was created", {
          user_id,
        });
      } else {
        // company has not yet been added to db, add it
        const new_company = await createNewCompany(company_name, company_url);
        company_id = new_company[0].id;
      }
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
    if (!paginated) {
      // only add new user company row if not paginated
      await createNewUserCompany(user_id, company_id, company_is_active);
    }
    logger.info("company created", {
      user_id,
      company_id,
    });
    res.redirect("/companies");
  } catch (error) {
    logger.error(error);
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

  logger.info("company was updated", { user_id, company_id });

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

  logger.info("Company was deleted", { user_id, company_id });
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
