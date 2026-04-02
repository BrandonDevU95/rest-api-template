import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware de contexto de request.
 *
 * Propaga o genera un x-correlation-id y lo expone en request y
 * response para trazabilidad entre servicios.
 */
export const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.header('x-correlation-id');
  const correlationId = incoming && incoming.trim().length > 0 ? incoming : uuidv4();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  next();
};
