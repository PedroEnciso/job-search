import express from "express";
import type { Request, Response } from "express";

export const view_router = express.Router();

view_router.get("/", (req: Request, res: Response) => {
  res.render("index");
});
