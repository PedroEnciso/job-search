import express from "express";
import type { Request, Response } from "express";
import { checkForUser } from "../middleware/checkForUser";

export const view_router = express.Router();

view_router.get("/", checkForUser, async (req: Request, res: Response) => {
  if (req.headers["hx-target"]) {
    res.render("companies");
  } else {
    res.render("index", { content: "companies" });
  }
});

view_router.get("/login", checkForUser, async (req: Request, res: Response) => {
  if (req.headers["hx-target"]) {
    res.render("login");
  } else {
    res.render("index", { content: "login" });
  }
});
