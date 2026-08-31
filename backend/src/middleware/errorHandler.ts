import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/errors";

/** Global error handler — must be registered last, after every route. Never
 * leaks internal error details (stack traces, DB errors) to the client;
 * those are logged server-side only. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.fields ? { fields: err.fields } : {}),
    });
  }

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      fields[String(issue.path[0] ?? "_")] = issue.message;
    }
    return res.status(422).json({ error: "Validation failed", fields });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}
