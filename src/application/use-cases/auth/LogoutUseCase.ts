import { tokenBlacklistService } from '../../services/TokenBlacklistService';
import { TokenService } from '../../services/TokenService';
import { UnauthorizedError } from '../../../shared/errors/AppError';

/**
 * Caso de uso de logout.
 *
 * Revoca los tokens agregandolos a la blacklist.
 */
export class LogoutUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const accessPayload = this.tokenService.verifyAccessToken(accessToken);
      if (!accessPayload.jti) {
        throw new UnauthorizedError('Invalid token for logout');
      }

      const accessExpiresAt = accessPayload.exp
        ? new Date(accessPayload.exp * 1000)
        : new Date(Date.now() + 15 * 60 * 1000);

      await tokenBlacklistService.addToBlacklist(accessPayload.jti, 'access', accessExpiresAt);

      if (refreshToken) {
        try {
          const refreshPayload = this.tokenService.verifyRefreshToken(refreshToken);
          if (refreshPayload.jti) {
            if (refreshPayload.sub !== accessPayload.sub) {
              throw new UnauthorizedError('Invalid token for logout');
            }
            const refreshExpiresAt = refreshPayload.exp
              ? new Date(refreshPayload.exp * 1000)
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await tokenBlacklistService.addToBlacklist(refreshPayload.jti, 'refresh', refreshExpiresAt);
          }
        } catch (error) {
          if (error instanceof UnauthorizedError) {
            throw error;
          }
          // No impedimos logout si el refresh ya expiro o es invalido.
        }
      }
    } catch {
      throw new UnauthorizedError('Invalid token for logout');
    }
  }
}


