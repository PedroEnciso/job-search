import { Request, Response } from "express";
import { getUserKeywords } from "../db/queries";
import { Supabase_User_Request } from "../middleware/checkForUser";

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
  console.log(req.body);
  res.send("hell yea");
}

export default {
  get_keywords,
  get_new_keywords,
  post_new_keywords,
};
