import { NextFunction, Request, Response } from 'express';

/**
 * Wraps async request handlers and forwards rejected promises to the global
 * error middleware.
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const asyncHandler =
  (handler: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
