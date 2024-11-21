import express from "express";
import { checkForUser } from "../middleware/checkForUser";
import {
  companies_controller,
  keywords_controller,
  current_jobs_controller,
} from "../controllers";

export const api_router = express.Router();

// Companies
api_router.get("/companies", checkForUser, companies_controller.get_companies);
api_router.post(
  "/companies",
  checkForUser,
  companies_controller.post_new_company
);
api_router.patch(
  "/companies",
  checkForUser,
  companies_controller.patch_company
);
api_router.delete(
  "/companies",
  checkForUser,
  companies_controller.delete_company
);
// Current Jobs
api_router.get(
  "/current_jobs",
  checkForUser,
  current_jobs_controller.get_current_jobs
);
// Keywords
api_router.get("/keywords", checkForUser, keywords_controller.get_keywords);
api_router.post(
  "/keywords",
  checkForUser,
  keywords_controller.post_new_keywords
);
api_router.delete(
  "/keywords",
  checkForUser,
  keywords_controller.delete_keyword
);
