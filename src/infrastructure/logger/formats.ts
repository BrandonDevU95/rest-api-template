import { format } from 'winston';

/**
 * Utilidades de formato de logs.
 *
 * redactFormat elimina datos sensibles antes de persistir, consoleFormat
 * mantiene legible el desarrollo local y jsonFormat produce logs estructurados.
 */
const sensitiveKeys = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'set-cookie',
  'secret',
  'apikey',
  'api-key',
  'creditcard',
  'x-api-key',
];

const jwtLikePattern = /\b[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const bearerPattern = /Bearer\s+[A-Za-z0-9._~+\/-]+/gi;

const redactString = (value: string): string => {
  return value
    .replace(bearerPattern, 'Bearer [REDACTED]')
    .replace(jwtLikePattern, '[REDACTED_JWT]');
};

const redactValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, currentValue]) => {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          acc[key] = '[REDACTED]';
          return acc;
        }

        acc[key] = redactValue(currentValue);
        return acc;
      },
      {},
    );
  }

  return value;
};

export const redactFormat = format((info) => {
  const cloned = { ...info };

  if (cloned.meta && typeof cloned.meta === 'object') {
    cloned.meta = redactValue(cloned.meta);
  }

  cloned.message = redactValue(cloned.message) as typeof cloned.message;

  return cloned;
});

export const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, correlationId }) => {
    const correlation = correlationId ? ` [cid:${String(correlationId)}]` : '';
    return `${String(timestamp)} ${level}${correlation}: ${String(message)}`;
  }),
);

export const jsonFormat = format.combine(format.timestamp(), format.errors({ stack: true }), format.json());
