import type { NextFunction, Request, Response } from "express";

/** Express 4 doesn't catch rejected promises from async handlers on its own —
 * an unhandled rejection there would hang the request instead of reaching
 * the error middleware. Wrap every async route handler with this. */
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Req, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
