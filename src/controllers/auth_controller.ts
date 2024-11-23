import type { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import SUPABASE_USER_CLASS from "../lib/supabase_user";
import { logger } from "../logger";

// GET /login
const get_login = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers["hx-target"]) {
      res.render("auth/login");
    } else {
      res.render("index", { content: "login" });
    }
  }
);
// POST /login
async function post_login(req: Request, res: Response, next: NextFunction) {
  try {
    // get validated email and password
    const { email, password } = validateLoginRequest(req.body);
    // login user using supabase_user
    const supabase_user = SUPABASE_USER_CLASS(req, res);
    const { data, error } = await supabase_user.sign_in(email, password);

    if (error) {
      logger.info("unsuccessful login");
      logger.error(error);
      // unsuccessful login, notify user
      res.render("auth/login", {
        error: error.message,
      });
    } else {
      logger.info("user logged in", {
        user_id: data.user?.id,
      });
      // success, load current jobs
      res.redirect("/");
    }
  } catch (error) {
    // log error
    logger.error(error);
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
    const supabase_user = SUPABASE_USER_CLASS(req, res);
    await supabase_user.sign_out();
    if (req.headers["hx-target"]) {
      res.render("auth/login");
    } else {
      res.render("index", { content: "login" });
    }
  }
);

function get_sign_up(req: Request, res: Response, next: NextFunction) {
  if (req.headers["hx-target"]) {
    res.render("auth/signup");
  } else {
    res.render("index", { content: "sign up" });
  }
}

async function post_sign_up(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = validateSignupRequest(req.body);
    const supabase_user = SUPABASE_USER_CLASS(req, res);
    const { data, error } = await supabase_user.sign_up(email, password, name);

    if (error) {
      logger.error(error);
      // unsuccessful sign up, notify user
      res.render("auth/signup", {
        error: error.message,
      });
    } else {
      logger.info("new user signed up", {
        user_id: data.user?.id,
      });
      // success, load current jobs
      res.redirect("/");
    }
  } catch (error) {
    logger.error(error);
    const message =
      error instanceof Error
        ? error.message
        : "There was an error signing you up. Please try again.";
    if (req.headers["hx-target"]) {
      res.render("auth/signup", { error: message });
    } else {
      res.render("index", { content: "sign up", error: message });
    }
  }
}

export default {
  get_login,
  post_login,
  get_logout,
  get_sign_up,
  post_sign_up,
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
      } else if (!validateEmail(email)) {
        throw new Error();
      }
    } else {
      throw new Error("Email is not defined.");
    }
    // validate password
    if ("current-password" in request) {
      password = request["current-password"] as string;
      if (!password) {
        throw new Error("Password is not defined.");
      } else if (password.length < 6) {
        throw new Error("Password must be 6 or more characters.");
      }
    } else {
      throw new Error("Password is not defined.");
    }
  }
  return { email, password };
}

function validateSignupRequest(request: LoginRequest | {}) {
  // validate password and email
  const { email, password } = validateLoginRequest(request);
  // validate name is included
  let name: string | undefined = undefined;
  if ("name" in request) {
    name = request["name"] as string;
    if (!name) {
      throw new Error("Please fill in your name.");
    }
  } else {
    throw new Error("Please fill in your name.");
  }
  // validate that confirm-password was included and is the same as password
  let confirm_password: string | undefined = undefined;
  if ("confirm-password" in request) {
    confirm_password = request["confirm-password"] as string;
    if (!confirm_password) {
      // throw an error if confirm-password was not included
      throw new Error("Please confirm your password.");
    } else if (confirm_password !== password) {
      // throw an error if confirm-password and password do not match
      throw new Error("Passwords do not match.");
    }
  } else {
    throw new Error("Please confirm your password.");
  }
  return { email, password, name };
}

interface LoginRequest {
  email?: string;
  password?: string;
  name?: string;
  confirm_password?: string;
}

function validateEmail(email: string) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
