import { Request, Response } from 'express';

import { HashService } from '../../application/services/HashService';
import { TokenService } from '../../application/services/TokenService';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { logger } from '../../infrastructure/logger/logger';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { getCurrentUser } from '../middlewares/currentUser.middleware';

/**
 * Controlador HTTP para endpoints de autenticacion.
 *
 * Responsabilidades:
 * - register: crear cuenta de usuario mediante RegisterUseCase.
 * - login: emitir par de tokens despues de que LocalStrategy inyecta req.user.
 * - refresh: intercambiar refresh token por un nuevo par de tokens.
 * - profile: retornar identidad del usuario autenticado.
 * - logout: revocar tokens activos.
 */
const userRepository = new UserRepository();
const hashService = new HashService();
const tokenService = new TokenService();

const registerUseCase = new RegisterUseCase(userRepository, hashService);
const refreshUseCase = new RefreshTokenUseCase(tokenService, userRepository);
const logoutUseCase = new LogoutUseCase(tokenService);

export class AuthController {
  /**
   * Registra un usuario nuevo.
   *
   * Responde 201 con proyeccion publica del usuario creado.
   */
  static async register(req: Request, res: Response): Promise<void> {
    const user = await registerUseCase.execute(req.body);

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  }

  /**
   * Inicia sesion y emite un par access/refresh.
   *
   * Precondicion: LocalStrategy ya valido credenciales y poblo req.user.
   */
  static async login(req: Request, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      logger.warn('Login rejected: credentials were not validated', {
        correlationId: req.correlationId,
        meta: {
          path: req.originalUrl,
          method: req.method,
        },
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = tokenService.createTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('Login succeeded', {
      correlationId: req.correlationId,
      meta: {
        userId: user.id,
        role: user.role,
        path: req.originalUrl,
        method: req.method,
      },
    });

    res.status(200).json(tokens);
  }

  /**
   * Intercambia un refresh token valido por un nuevo par de tokens.
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    const tokens = await refreshUseCase.execute(req.body.refreshToken as string);
    res.status(200).json(tokens);
  }

  /**
   * Cierra sesion revocando el access token actual y, si se envia,
   * tambien el refresh token asociado al mismo usuario.
   */
  static async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || '';
    const refreshToken = req.body.refreshToken || '';

    await logoutUseCase.execute(accessToken, refreshToken);

    logger.info('User logged out', {
      correlationId: req.correlationId,
    });

    res.status(204).send();
  }

  /**
   * Retorna la identidad del usuario autenticado actual.
   */
  static async profile(req: Request, res: Response): Promise<void> {
    const user = getCurrentUser(req);
    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
