import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Inside custom error handler");
  if (res.headersSent) {
    return next(err);
  }
  if (err.message.includes("code")) {
    const error = JSON.parse(err.message);
    console.error(error);
    return res.status(error.code).send(error);
  }
  return res.status(500).send({
    code: 500,
    message: `Ped error!`,
    error: true,
  });
};
