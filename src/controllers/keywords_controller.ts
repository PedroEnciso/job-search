import { Request, Response } from "express";
import {
  createNewKeywords,
  createNewUserKeywords,
  deleteUserKeyword,
  getUserKeywords,
} from "../db/queries";
import { Supabase_User_Request } from "../middleware/checkForUser";
import { check } from "express-validator";
import { logger } from "../logger";

async function get_keywords(req: Request, res: Response) {
  try {
    const { user_id } = req.supabase_user as Supabase_User_Request;
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
  } catch (error) {
    logger.error(error);
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
    logger.info("keywords were created", {
      user_id,
      keywords: keywords.join(", "),
    });
    res.redirect("/keywords");
  } catch (error) {
    logger.error(error);
    res.render("index", {
      page: "Keywords",
      content: "new keywords",
      error,
      inputs: 1,
    });
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
    // get user's keywords
    const user_keywords = await getUserKeywords(user_id);

    logger.info("keyword was deleted", { user_id, keyword_id });

    // render
    res.render("keywords/keywords", {
      keywords: user_keywords,
    });
  } catch (error) {
    logger.error(error);
    res.render("error", {
      message:
        "There was an issue deleting a keyword. Please refresh the page.",
    });
  }
}

export default {
  get_keywords,
  get_new_keywords,
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
