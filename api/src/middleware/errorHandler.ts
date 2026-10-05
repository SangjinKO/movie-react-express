import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, requestId },
    });
    return;
  }

  console.error(`[${requestId}] Unhandled error:`, err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Unexpected server error", requestId },
  });
}
