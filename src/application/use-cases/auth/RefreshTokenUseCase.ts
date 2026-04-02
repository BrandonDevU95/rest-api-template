import { TokenService } from '../../services/TokenService';
import { TokenPairDto } from '../../dto/auth.dto';

/**
 * Orquestacion del flujo de refresh token.
 *
 * Verifica el refresh token recibido y reemite un nuevo par de tokens
 * usando el payload verificado.
 */
export class RefreshTokenUseCase {
  constructor(private readonly tokenService: TokenService) {}

  execute(refreshToken: string): TokenPairDto {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    return this.tokenService.createTokenPair({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  }
}
