import express from "express";
import { checkForUser } from "../middleware/checkForUser";
import { auth_controller, view_controller } from "../controllers";

export const view_router = express.Router();

// index
view_router.get("/", checkForUser, view_controller.get_index);
// companies
view_router.get("/companies", checkForUser, view_controller.get_companies);
view_router.get(
  "/companies/new",
  checkForUser,
  view_controller.get_new_company
);
view_router.post(
  "/companies/new",
  checkForUser,
  view_controller.post_new_company
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
