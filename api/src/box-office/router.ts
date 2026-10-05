import { Router } from "express";
import { getBoxOffice } from "./service.js";

export const boxOfficeRouter = Router();

boxOfficeRouter.get("/box-office", async (req, res, next) => {
  try {
    const result = await getBoxOffice();
    res.json(result);
  } catch (err) {
    next(err);
  }
});
