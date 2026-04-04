import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware de contexto de request.
 *
 * Propaga o genera un x-correlation-id y lo expone en request y
 * response para trazabilidad entre servicios.
 */
const correlationIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

const sanitizeCorrelationId = (candidate: string | undefined): string | null => {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed || !correlationIdPattern.test(trimmed)) {
    return null;
  }

  return trimmed;
};

export const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = sanitizeCorrelationId(req.header('x-correlation-id') ?? undefined);
  const correlationId = incoming ?? uuidv4();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  next();
};
