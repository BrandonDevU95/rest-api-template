import morgan from 'morgan';
import { env } from '../../config/environment';
import { logger } from './logger';

/**
 * Middleware de logging de requests HTTP.
 *
 * Integra Morgan con Winston y agrega correlation-id a cada linea de log.
 * En produccion se omiten health checks para reducir ruido en logs.
 *
 * Se omiten query params en el path loggeado para reducir riesgo de fuga de tokens/PII.
 */
morgan.token('correlation-id', (req) => {
  const request = req as unknown as { correlationId?: string };
  return request.correlationId ?? '-';
});

morgan.token('path-no-query', (req) => {
  const request = req as unknown as { originalUrl?: string; url?: string };
  const rawPath = request.originalUrl ?? request.url ?? '';
  return rawPath.split('?')[0] ?? '';
});

const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

export const httpLogger = morgan(
  ':method :path-no-query :status :res[content-length] - :response-time ms cid=:correlation-id',
  {
    stream,
    skip: (req) => {
      const request = req as unknown as { originalUrl?: string; url?: string };
      const path = (request.originalUrl ?? request.url ?? '').split('?')[0] ?? '';
      return path.endsWith('/health') && env.isProduction;
    },
  },
);
