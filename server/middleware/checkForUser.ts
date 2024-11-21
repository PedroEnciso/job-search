import type { Request, Response, NextFunction } from "express";
import SUPABASE_USER_CLASS from "../lib/supabase_user";
import type { Supabase_User } from "../lib/supabase_user";

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
    const cheat_user = await supabase_user.sign_in_cheat();
    req.supabase_user = { ...supabase_user, user_id: cheat_user.user.id };
  } else {
    req.supabase_user = { ...supabase_user, user_id: user.id };
  }

  next();
}

export interface Supabase_User_Request extends Supabase_User {
  user_id: string;
}
