import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requestId } from "./middleware/requestId.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { reviewsRouter } from "./reviews/router.js";
import { boxOfficeRouter } from "./box-office/router.js";
import { healthRouter } from "./health/router.js";

export function buildApp() {
  const app = express();

  app.use(requestId);
  app.use(express.json({ limit: "100kb" }));
  app.use(cors({ origin: env.corsOrigin }));

  app.use("/api/movie/v1", reviewsRouter);
  app.use("/api/movie/v1", boxOfficeRouter);
  app.use("/api/movie/v1", healthRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
