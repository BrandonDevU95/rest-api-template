import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { TokenPairDto } from '../../dto/auth.dto';
import { TokenService } from '../../services/TokenService';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import { tokenBlacklistService } from '../../services/TokenBlacklistService';

/**
 * Orquestacion del flujo de refresh token.
 *
 * Verifica el refresh token recibido, revalida el usuario contra BD y emite
 * un nuevo par de tokens con datos frescos.
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(refreshToken: string): Promise<TokenPairDto> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);

      if (!payload.jti) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      if (await tokenBlacklistService.isBlacklisted(payload.jti)) {
        throw new UnauthorizedError('Refresh token has been revoked');
      }

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedError('User not found or has been deleted');
      }

      const refreshExpiresAt = payload.exp
        ? new Date(payload.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await tokenBlacklistService.addToBlacklist(payload.jti, 'refresh', refreshExpiresAt);

      return this.tokenService.createTokenPair({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}
