import { Request, Response } from "express";
import {
  createNewKeywords,
  createNewUserKeywords,
  getUserKeywords,
} from "../db/queries";
import { Supabase_User_Request } from "../middleware/checkForUser";
import { check } from "express-validator";

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
    res.redirect("/keywords");
  } catch (error) {
    res.render("index", {
      page: "Keywords",
      content: "new keywords",
      error,
      inputs: 1,
    });
  }
}

export default {
  get_keywords,
  get_new_keywords,
  post_new_keywords,
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
