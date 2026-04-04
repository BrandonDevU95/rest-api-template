import { UnauthorizedError } from '../../../shared/errors/AppError';
import { tokenBlacklistService } from '../../services/TokenBlacklistService';
import { TokenService } from '../../services/TokenService';

/**
 * Caso de uso de logout.
 *
 * Revoca el access token actual y opcionalmente el refresh token,
 * agregando sus jti a la blacklist.
 *
 * Si llega refresh token, debe pertenecer al mismo usuario del access token.
 */
export class LogoutUseCase {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Ejecuta cierre de sesion con revocacion por jti.
   */
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

            await tokenBlacklistService.addToBlacklist(
              refreshPayload.jti,
              'refresh',
              refreshExpiresAt,
            );
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
