import { Request, Response } from 'express';

import { HashService } from '../../application/services/HashService';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { TokenService } from '../../application/services/TokenService';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { getCurrentUser } from '../middlewares/currentUser.middleware';
import { logger } from '../../infrastructure/logger/logger';

/**
 * Controlador HTTP para endpoints de autenticacion.
 *
 * Responsabilidades:
 * - register: crear cuenta de usuario mediante RegisterUseCase.
 * - login: emitir par de tokens despues de que LocalStrategy inyecta req.user.
 * - refresh: intercambiar refresh token por un nuevo par de tokens.
 * - profile: retornar identidad del usuario autenticado.
 */
const userRepository = new UserRepository();
const hashService = new HashService();
const tokenService = new TokenService();

const registerUseCase = new RegisterUseCase(userRepository, hashService, tokenService);
const refreshUseCase = new RefreshTokenUseCase(tokenService);

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const tokens = await registerUseCase.execute(req.body);
    res.status(201).json(tokens);
  }

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

  static async refresh(req: Request, res: Response): Promise<void> {
    const tokens = refreshUseCase.execute(req.body.refreshToken as string);
    res.status(200).json(tokens);
  }

  static async profile(req: Request, res: Response): Promise<void> {
    const user = getCurrentUser(req);
    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}

