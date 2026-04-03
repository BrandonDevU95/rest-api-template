import { Router } from 'express';
import Joi from 'joi';
import { AuthController } from '../controllers/AuthController';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.validators';
import { loginRateLimiter } from '../middlewares/security.middleware';
import { passport } from '../../infrastructure/auth/passport';
import { authenticateJwt } from '../middlewares/auth.middleware';

/**
 * Registro de rutas de autenticacion.
 *
 * Define la cadena de middlewares por endpoint para validacion, rate limiting,
 * estrategia de autenticacion y ejecucion del controlador.
 */
export const authRouter = Router();

const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

authRouter.post('/register', validate({ body: registerSchema }), asyncHandler(AuthController.register));
authRouter.post(
  '/login',
  loginRateLimiter,
  validate({ body: loginSchema }),
  passport.authenticate('local', { session: false }),
  asyncHandler(AuthController.login),
);
authRouter.post('/refresh', loginRateLimiter, validate({ body: refreshSchema }), asyncHandler(AuthController.refresh));
authRouter.post('/logout', authenticateJwt, validate({ body: logoutSchema }), asyncHandler(AuthController.logout));
authRouter.get('/profile', authenticateJwt, asyncHandler(AuthController.profile));
