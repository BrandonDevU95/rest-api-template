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

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registrar cuenta de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 12
 *                 maxLength: 64
 *                 pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       400:
 *         description: Error de validacion
 *       409:
 *         description: Email ya registrado
 *       429:
 *         description: Demasiados intentos de registro
 */

authRouter.post(
  '/register',
  registerRateLimiter,
  validate({ body: registerSchema, query: noQuerySchema }),
  asyncHandler(AuthController.register),
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesion
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 12
 *                 maxLength: 64
 *                 pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$
 *     responses:
 *       200:
 *         description: Par de tokens emitido
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: Credenciales invalidas
 *       429:
 *         description: Demasiados intentos de login
 */

authRouter.post(
  '/login',
  loginRateLimiter,
  validate({ body: loginSchema, query: noQuerySchema }),
  passport.authenticate('local', { session: false }),
  asyncHandler(AuthController.login),
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Renovar access y refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Par de tokens renovado
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: Refresh token invalido, expirado o revocado
 *       429:
 *         description: Demasiados intentos
 */

authRouter.post(
  '/refresh',
  loginRateLimiter,
  validate({ body: refreshSchema, query: noQuerySchema }),
  asyncHandler(AuthController.refresh),
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesion y revocar tokens activos
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       204:
 *         description: Sesion cerrada
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: Token invalido o no autorizado
 */

authRouter.post(
  '/logout',
  authenticateJwt,
  validate({ body: logoutSchema, query: noQuerySchema }),
  asyncHandler(AuthController.logout),
);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario actual
 *       401:
 *         description: Token faltante o invalido
 */

authRouter.get(
  '/profile',
  authenticateJwt,
  validate({ query: noQuerySchema }),
  asyncHandler(AuthController.profile),
);
