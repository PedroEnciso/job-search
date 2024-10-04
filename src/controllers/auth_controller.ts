import type { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import SUPABASE_USER_CLASS from "../lib/supabase_user";

// GET /login
const get_login = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("getting login");

    if (req.headers["hx-target"]) {
      res.render("auth/login");
    } else {
      res.render("index", { content: "login" });
    }
  }
);
// POST /login
async function post_login(req: Request, res: Response, next: NextFunction) {
  console.log("post login", req.body);
  try {
    // get validated email and password
    const { email, password } = validateLoginRequest(req.body);
    // login user using supabase_user
    const supabase_user = SUPABASE_USER_CLASS(req, res);
    const { error } = await supabase_user.sign_in(email, password);

    if (error) {
      // "There are no records matching this email and password."
      setTimeout(() => {
        res.render("auth/login", {
          error: error.message,
        });
      }, 5000);
    } else {
      res.render("current_jobs/current_jobs");
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "There was an error logging in. Please try again.s";
    if (req.headers["hx-target"]) {
      res.render("auth/login", { error: message });
    } else {
      res.render("index", { content: "login", error: message });
    }
  }
}

const get_logout = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("logging out");
    const supabase_user = SUPABASE_USER_CLASS(req, res);
    await supabase_user.sign_out();
    if (req.headers["hx-target"]) {
      res.render("auth/login");
    } else {
      res.render("index", { content: "login" });
    }
  }
);

export default {
  get_login,
  post_login,
  get_logout,
};

function validateLoginRequest(request: LoginRequest | {}): {
  email: string;
  password: string;
} {
  let email: string | undefined = undefined;
  let password: string | undefined = undefined;

  if (Object.keys.length === 0) {
    // empty object, throw error
    throw new Error("No credentials were provided.");
  } else {
    // validate email
    if ("email" in request) {
      email = request.email;
      if (!email) {
        throw new Error("Email is not defined.");
      } else if (!validateEmail) {
        throw new Error();
      }
    } else {
      throw new Error("Email is not defined.");
    }
    // validate password
    if ("current-password" in request) {
      password = request["current-password"] as string;
      if (!password) {
        console.log("check 1 password:", password);
        throw new Error("Password is not defined.");
      } else if (password.length < 6) {
        throw new Error("Password must be 6 or more characters.");
      }
    } else {
      console.log("check 2 password:", password);
      throw new Error("Password is not defined.");
    }
  }
  return { email, password };
}

interface LoginRequest {
  email?: string;
  password?: string;
}

function validateEmail(email: string) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
