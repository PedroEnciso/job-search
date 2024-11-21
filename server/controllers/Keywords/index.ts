import { Request, Response } from "express";
import {
  createNewKeywords,
  createNewUserKeywords,
  deleteUserKeyword,
  getUserKeywords,
} from "../../db/queries";
import { Supabase_User_Request } from "../../middleware/checkForUser";
import { check } from "express-validator";
import { logger } from "../../logger";

async function get_keywords(req: Request, res: Response) {
  try {
    const { user_id } = req.supabase_user as Supabase_User_Request;
    const user_keywords = await getUserKeywords(user_id);
    res.json(user_keywords);
  } catch (error) {
    // log the specific error
    if (error instanceof Error) {
      logger.error(error.message);
    } else if (error instanceof String) {
      logger.error(error);
    } else {
      logger.error("Error in GET /keywords");
    }
    // send generic error
    throw new Error("There was an error getting your keywords.");
  }
}

async function post_new_keywords(req: Request, res: Response) {
  try {
    const { user_id } = req.supabase_user as Supabase_User_Request;
    // get validated & sanitized keywords as an array
    const keywords = await validateNewKeywords(req);
    // check if there are keywords to add
    if (keywords.length === 0) {
      throw new Error("No keywords are valid.");
    }
    // add keywords to keywords table
    const new_keywords = await createNewKeywords(keywords);
    // add keyword user relations to user_keywords
    await createNewUserKeywords(
      new_keywords.map((key) => key.id),
      user_id
    );
    res.json(new_keywords);
  } catch (error) {
    // log the specific error
    if (error instanceof Error) {
      logger.error(error.message);
    } else if (error instanceof String) {
      logger.error(error);
    } else {
      logger.error("Error in POST /keywords");
    }
    // send generic error
    throw new Error("There was an error adding your keywords.");
  }
}

async function delete_keyword(req: Request, res: Response) {
  try {
    // get user id
    const { user_id } = req.supabase_user as Supabase_User_Request;
    // get the keyword id
    const { id } = req.params;
    // get the id as a number
    const keyword_id = parseInt(id);
    // check that the id is a number
    if (!isNaN(keyword_id)) {
      // id is a number, delete
      await deleteUserKeyword(user_id, keyword_id);
    }
    // send success status
    res.status(200).send();
  } catch (error) {
    // log the specific error
    if (error instanceof Error) {
      logger.error(error.message);
    } else if (error instanceof String) {
      logger.error(error);
    } else {
      logger.error("Error in DELETE /keywords");
    }
    // send generic error
    throw new Error("There was an error deleting this keyword.");
  }
}

export default {
  get_keywords,
  post_new_keywords,
  delete_keyword,
};

async function validateNewKeywords(req: Request) {
  const valid_keywords: string[] = [];
  for (let key in req.body) {
    const result = await check(key).trim().notEmpty().escape().run(req);
    if (result.isEmpty()) {
      valid_keywords.push(req.body[key]);
    }
  }
  return valid_keywords;
}
