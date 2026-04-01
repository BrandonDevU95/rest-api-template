import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../../config/environment';

export const helmetMiddleware = helmet();

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || env.security.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});

export const apiRateLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  limit: env.security.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
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
