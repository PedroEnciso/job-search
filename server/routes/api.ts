import express from "express";
import { checkForUser } from "../middleware/checkForUser";
import companies_controller from "../controllers/Companies";

export const api_router = express.Router();

// Companies
api_router.get("/companies", checkForUser, companies_controller.get_companies);

// Current Jobs
// Keywords
