import type { NextFunction, Request, Response } from "express";

/** Zero-cost first line of spam defense: a hidden field real visitors never
 * fill in (the contact form must render it off-screen/display:none, never
 * `type="hidden"` alone — some bots skip those). If it's non-empty, respond
 * as if the submission succeeded (never tip off a bot that it was caught)
 * but don't touch the database or send an email. */
export function checkHoneypot(req: Request, res: Response, next: NextFunction) {
  if (req.body?.honeypot) {
    return res.status(201).json({ id: "discarded", status: "received" });
  }
  next();
}
