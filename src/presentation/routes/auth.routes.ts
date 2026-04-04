import { loginRateLimiter, registerRateLimiter } from '../middlewares/security.middleware';
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from '../validators/auth.validators';

import { Router } from 'express';
import { passport } from '../../infrastructure/auth/passport';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { AuthController } from '../controllers/AuthController';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { joi, validate } from '../middlewares/validate.middleware';

/**
 * Registro de rutas de autenticacion.
 *
 * Define la cadena de middlewares por endpoint para validacion, rate limiting,
 * estrategia de autenticacion y ejecucion del controlador.
 */
export const authRouter = Router();

/**
 * Schema comun para forzar query params vacios en endpoints de auth.
 */
const noQuerySchema = joi.object({});

authRouter.post(
  '/register',
  registerRateLimiter,
  validate({ body: registerSchema, query: noQuerySchema }),
  asyncHandler(AuthController.register),
);
authRouter.post(
  '/login',
  loginRateLimiter,
  validate({ body: loginSchema, query: noQuerySchema }),
  passport.authenticate('local', { session: false }),
  asyncHandler(AuthController.login),
);
authRouter.post(
  '/refresh',
  loginRateLimiter,
  validate({ body: refreshSchema, query: noQuerySchema }),
  asyncHandler(AuthController.refresh),
);
authRouter.post(
  '/logout',
  authenticateJwt,
  validate({ body: logoutSchema, query: noQuerySchema }),
  asyncHandler(AuthController.logout),
);
authRouter.get(
  '/profile',
  authenticateJwt,
  validate({ query: noQuerySchema }),
  asyncHandler(AuthController.profile),
);
