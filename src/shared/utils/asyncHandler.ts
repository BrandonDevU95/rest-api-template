import { NextFunction, Request, Response } from 'express';

/**
 * Envuelve handlers de request y reenvia promesas rechazadas al middleware global de
 * errores.
 */
export type RequestHandlerResult = void | Promise<void>;

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => RequestHandlerResult;

export const asyncHandler =
  (handler: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
