import { Request, Response } from 'express';
import { TokenService } from '../../application/services/TokenService';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { HashService } from '../../application/services/HashService';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { getCurrentUser } from '../middlewares/currentUser.middleware';

/**
 * HTTP controller for authentication endpoints.
 *
 * Responsibilities:
 * - register: create user account through RegisterUseCase.
 * - login: issue token pair after LocalStrategy injects req.user.
 * - refresh: exchange refresh token for a new token pair.
 * - profile: return authenticated user identity.
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
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = tokenService.createTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
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
