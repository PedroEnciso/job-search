import express from "express";
import { checkForUser } from "../middleware/checkForUser";
import { auth_controller, view_controller } from "../controllers";

export const view_router = express.Router();

// index
view_router.get("/", checkForUser, view_controller.get_index);
// login
view_router.get("/login", checkForUser, auth_controller.get_login);
view_router.post("/login", auth_controller.post_login);
// logout
view_router.get("/logout", auth_controller.get_logout);
