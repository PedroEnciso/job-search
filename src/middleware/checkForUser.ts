import type { Request, Response, NextFunction } from "express";
import SUPABASE_USER_CLASS from "../lib/supabase_user";

export async function checkForUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const supabase_user = SUPABASE_USER_CLASS(req, res);
  const {
    data: { user },
  } = await supabase_user.get_user();

  if (!user) {
    // not logged in
    if (req.path === "/login" || req.path === "/sign-up") {
      // already trying to sign up, proceed
      next();
    } else {
      // redirect to login
      res.redirect("/login");
    }
  } else {
    // user is logged in
    if (req.path === "/login" || req.path === "/sign-up") {
      // trying to go to a sign in page, send to home
      res.redirect("/");
    } else {
      // proceed
      req.supabase_user = supabase_user;
      next();
    }
  }
}
