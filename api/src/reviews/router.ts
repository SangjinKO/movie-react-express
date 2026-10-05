import { Router } from "express";
import { getReview, listReviews } from "./service.js";

export const reviewsRouter = Router();

reviewsRouter.get("/reviews", async (req, res, next) => {
  try {
    const result = await listReviews();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

reviewsRouter.get("/reviews/:id", async (req, res, next) => {
  try {
    const review = await getReview(req.params.id);
    res.json(review);
  } catch (err) {
    next(err);
  }
});
