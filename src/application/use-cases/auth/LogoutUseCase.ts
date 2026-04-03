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

  execute(accessToken: string, refreshToken?: string): void {
    try {
      const accessPayload = this.tokenService.verifyAccessToken(accessToken);
      if (!accessPayload.jti) {
        throw new UnauthorizedError('Invalid token for logout');
      }
      tokenBlacklistService.addToBlacklist(accessPayload.jti);

      if (refreshToken) {
        try {
          const refreshPayload = this.tokenService.verifyRefreshToken(refreshToken);
          if (refreshPayload.jti) {
            tokenBlacklistService.addToBlacklist(refreshPayload.jti);
          }
        } catch {
          // No impedimos logout si el refresh ya expiro o es invalido.
        }
      }
    } catch {
      throw new UnauthorizedError('Invalid token for logout');
    }
  }
}
