import { TokenPairDto } from '../../dto/auth.dto';
import { TokenService } from '../../services/TokenService';
import { UnauthorizedError } from '../../../shared/errors/AppError';

/**
 * Orquestacion del flujo de refresh token.
 *
 * Verifica el refresh token recibido y reemite un nuevo par de tokens
 * usando el payload verificado.
 */
export class RefreshTokenUseCase {
  constructor(private readonly tokenService: TokenService) {}

  execute(refreshToken: string): TokenPairDto {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      return this.tokenService.createTokenPair({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      });
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}
