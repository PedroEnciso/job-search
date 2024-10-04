import { Request, Response } from "express";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import {
  AuthError,
  Session,
  User,
  UserResponse,
  WeakPassword,
} from "@supabase/supabase-js";

function SUPABASE_USER_CLASS(req: Request, res: Response) {
  const error_message = "Error in SUPABASE_USER_CLASS method";

  function createClient(context: { req: Request; res: Response }) {
    return createServerClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(context.req.headers.cookie ?? "");
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              context.res.appendHeader(
                "Set-Cookie",
                serializeCookieHeader(name, value, options)
              )
            );
          },
        },
      }
    );
  }

  const supabase_user = createClient({ req, res });

  async function sign_in(email: string, password: string) {
    const { data, error } = await supabase_user.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }

  async function sign_in_cheat() {
    console.log("Signing in...");
    const { data, error } = await supabase_user.auth.signInWithPassword({
      email: "ped.enciso@gmail.com",
      password: "#1keeper",
    });

    if (error) {
      console.error(error);
      throw new Error(`${error_message} sign_in`);
    }

    return data;
  }

  async function sign_out() {
    console.log("Signing out...");
    const { error } = await supabase_user.auth.signOut();

    if (error) {
      console.error(error);
      throw new Error(`${error_message} sign_out`);
    }
  }

  async function get_user() {
    return supabase_user.auth.getUser();
  }

  return { sign_in, sign_in_cheat, sign_out, get_user };
}

export default SUPABASE_USER_CLASS;

export interface Supabase_User {
  sign_in: (
    email: string,
    password: string
  ) => Promise<{
    data:
      | {
          user: User;
          session: Session;
          weakPassword?: WeakPassword | undefined;
        }
      | { user: null; session: null; weakPassword?: null | undefined };
    error: AuthError | null;
  }>;
  sign_in_cheat: () => Promise<{
    user: User;
    session: Session;
    weakPassword?: WeakPassword;
  }>;
  sign_out: () => Promise<void>;
  get_user: () => Promise<UserResponse>;
}
