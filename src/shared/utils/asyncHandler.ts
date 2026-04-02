import { NextFunction, Request, Response } from 'express';

/**
 * Envuelve handlers async de request y reenvia promesas rechazadas al middleware global de
 * errores.
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
