import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request context middleware.
 *
 * Propagates or generates an x-correlation-id and exposes it on request and
 * response for cross-service tracing.
 */
export const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.header('x-correlation-id');
  const correlationId = incoming && incoming.trim().length > 0 ? incoming : uuidv4();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  next();
};
