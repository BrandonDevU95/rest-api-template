import { NextFunction, Request, Response } from 'express';
import { env } from '../../config/environment';
import { logger } from '../../infrastructure/logger/logger';
import { AppError } from '../../shared/errors/AppError';

/**
 * Middlewares globales de error HTTP.
 *
 * - notFoundHandler convierte rutas no encontradas en AppError NOT_FOUND.
 * - errorHandler normaliza errores, registra con correlationId y retorna
 *   el contrato publico de error consumido por clientes.
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  void next;
  const appError = err instanceof AppError ? err : new AppError('Internal server error');
  const originalError =
    err instanceof AppError
      ? undefined
      : {
          name: err.name,
          message: err.message,
          stack: err.stack,
        };

  logger.error(appError.message, {
    correlationId: req.correlationId,
    meta: {
      code: appError.code,
      statusCode: appError.statusCode,
      stack: env.isProduction ? undefined : appError.stack,
      originalError: env.isProduction ? undefined : originalError,
      path: req.originalUrl,
      method: req.method,
    },
  });

  res.status(appError.statusCode).json({
    code: appError.code,
    message: appError.message,
    details: appError.details,
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
  });
};
