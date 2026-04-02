import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.validators';
import { loginRateLimiter } from '../middlewares/security.middleware';
import { passport } from '../../infrastructure/auth/passport';
import { authenticateJwt } from '../middlewares/auth.middleware';

/**
 * Authentication route registrations.
 *
 * Defines middleware chain per endpoint for validation, rate limiting,
 * authentication strategy, and controller execution.
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
authRouter.post('/refresh', validate({ body: refreshSchema }), asyncHandler(AuthController.refresh));
authRouter.get('/profile', authenticateJwt, asyncHandler(AuthController.profile));
