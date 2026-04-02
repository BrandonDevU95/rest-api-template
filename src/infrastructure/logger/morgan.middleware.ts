import morgan from 'morgan';
import { env } from '../../config/environment';
import { logger } from './logger';

/**
 * Middleware de logging de requests HTTP.
 *
 * Integra Morgan con Winston y agrega correlation-id a cada linea de log.
 * En produccion se omiten health checks para reducir ruido en logs.
 */
morgan.token('correlation-id', (req) => {
  const request = req as unknown as { correlationId?: string };
  return request.correlationId ?? '-';
});

const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

export const httpLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms cid=:correlation-id',
  {
    stream,
    skip: (req) => {
      const request = req as unknown as { originalUrl?: string; url?: string };
      const path = request.originalUrl ?? request.url ?? '';
      return path.endsWith('/health') && env.isProduction;
    },
  },
);
