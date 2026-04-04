import { ForbiddenError } from '../../shared/errors/AppError';
import cors from 'cors';
import { env } from '../../config/environment';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Middlewares de seguridad centralizados.
 *
 * Las politicas se definen desde la configuracion de entorno e incluyen:
 * - headers HTTP seguros (helmet)
 * - validaciones de allowlist CORS
 * - rate limiting global, login y registro
 */
export const helmetMiddleware = helmet();

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || env.security.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new ForbiddenError('Origin not allowed by CORS'));
  },
  credentials: true,
});

export const apiRateLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  limit: env.security.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerRateLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  limit: env.security.rateLimitRegisterMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'TOO_MANY_REGISTRATION_ATTEMPTS',
    message: 'Too many registration attempts. Please try again later.',
  },
});
export const loginRateLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  limit: env.security.rateLimitLoginMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
    message: 'Too many login attempts. Please try again later.',
  },
});

