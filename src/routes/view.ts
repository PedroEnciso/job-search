import express from "express";
import { checkForUser } from "../middleware/checkForUser";
import {
  auth_controller,
  current_openings_controller,
  companies_controller,
  keywords_controller,
} from "../controllers";

export const view_router = express.Router();

// index
view_router.get(
  "/",
  checkForUser,
  current_openings_controller.get_current_openings
);
// companies
view_router.get("/companies", checkForUser, companies_controller.get_companies);
view_router.get(
  "/companies/new",
  checkForUser,
  companies_controller.get_new_company
);
view_router.patch(
  "/companies/:id",
  checkForUser,
  companies_controller.patch_company
);
view_router.delete(
  "/companies/:id",
  checkForUser,
  companies_controller.delete_company
);
view_router.post(
  "/companies/new",
  checkForUser,
  companies_controller.post_new_company
);
// keywords
view_router.get("/keywords", checkForUser, keywords_controller.get_keywords);
view_router.get(
  "/keywords/new",
  checkForUser,
  keywords_controller.get_new_keywords
);
view_router.post(
  "/keywords/new",
  checkForUser,
  keywords_controller.post_new_keywords
);
view_router.delete(
  "/keywords/:id",
  checkForUser,
  keywords_controller.delete_keyword
);
//// AUTH ROUTES
// login
view_router.get("/login", checkForUser, auth_controller.get_login);
view_router.post("/login", auth_controller.post_login);
// sign up
view_router.get("/sign-up", checkForUser, auth_controller.get_sign_up);
view_router.post("/sign-up", auth_controller.post_sign_up);
// logout
view_router.get("/logout", auth_controller.get_logout);
