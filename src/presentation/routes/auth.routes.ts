import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.validators';

import { AuthController } from '../controllers/AuthController';
import { Router } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { loginRateLimiter } from '../middlewares/security.middleware';
import { passport } from '../../infrastructure/auth/passport';
import { validate } from '../middlewares/validate.middleware';

/**
 * Registro de rutas de autenticacion.
 *
 * Define la cadena de middlewares por endpoint para validacion, rate limiting,
 * estrategia de autenticacion y ejecucion del controlador.
 */
export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), asyncHandler(AuthController.register));
authRouter.post(
  '/login',
  loginRateLimiter,
  validate({ body: loginSchema }),
  passport.authenticate('local', { session: false }),
  asyncHandler(AuthController.login),
);
authRouter.post('/refresh', loginRateLimiter, validate({ body: refreshSchema }), asyncHandler(AuthController.refresh));
authRouter.get('/profile', authenticateJwt, asyncHandler(AuthController.profile));
