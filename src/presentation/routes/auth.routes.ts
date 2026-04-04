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
 * components:
 *   schemas:
 *     AuthTokensResponse:
 *       type: object
 *       required: [accessToken, refreshToken]
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *     AuthProfileResponse:
 *       type: object
 *       required: [id, email, role]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [admin, user]
 *     AuthRegisterResponse:
 *       type: object
 *       required: [id, email, role, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [admin, user]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ErrorResponse:
 *       type: object
 *       required: [code, message, correlationId, timestamp]
 *       properties:
 *         code:
 *           type: string
 *         message:
 *           type: string
 *         details:
 *           type: object
 *           nullable: true
 *           additionalProperties: true
 *         correlationId:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRegisterResponse'
 *             example:
 *               id: 7f5c8a91-4c76-4d93-9c0f-7b2da49f8b52
 *               email: user@example.com
 *               role: user
 *               createdAt: 2026-04-04T12:00:00.000Z
 *       400:
 *         description: Error de validacion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiados intentos de registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Error de validacion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciales invalidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiados intentos de login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *       400:
 *         description: Error de validacion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Refresh token invalido, expirado o revocado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiados intentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token invalido o no autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthProfileResponse'
 *             example:
 *               id: 7f5c8a91-4c76-4d93-9c0f-7b2da49f8b52
 *               email: user@example.com
 *               role: user
 *       401:
 *         description: Token faltante o invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

authRouter.get(
  '/profile',
  authenticateJwt,
  validate({ query: noQuerySchema }),
  asyncHandler(AuthController.profile),
);
