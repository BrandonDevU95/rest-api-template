import { format } from 'winston';

/**
 * Log formatting helpers.
 *
 * redactFormat removes sensitive data before persistence, consoleFormat
 * keeps local development readable, and jsonFormat produces structured logs.
 */
const sensitiveKeys = ['password', 'token', 'authorization', 'cookie', 'creditCard'];

const redactValue = (value: unknown): unknown => {
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

  if (cloned.message && typeof cloned.message === 'object') {
    cloned.message = redactValue(cloned.message);
  }

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
