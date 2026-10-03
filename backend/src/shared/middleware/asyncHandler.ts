import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Forward a rejected async handler to the Express error pipeline.
 *
 * Express 4 does NOT attach a rejection handler to the promise a route handler
 * returns. An `async` controller that throws therefore produces an unhandled
 * rejection, which under Node's default settings terminates the process — so a
 * routine 409 or 401 would take the whole server down instead of returning a
 * response. (Express 5 handles this natively; this project is on 4.19.)
 *
 * Every async route handler must be wrapped: `router.post('/x', asyncHandler(fn))`.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
