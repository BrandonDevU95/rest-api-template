import { Request, Response } from 'express';
import { TokenService } from '../../application/services/TokenService';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { HashService } from '../../application/services/HashService';
import { UnauthorizedError } from '../../shared/errors/AppError';

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
    const user = req.user as { id: string; email: string; role: 'admin' | 'user' } | undefined;

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
    const user = req.user as { id: string; email: string; role: 'admin' | 'user' };
    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
