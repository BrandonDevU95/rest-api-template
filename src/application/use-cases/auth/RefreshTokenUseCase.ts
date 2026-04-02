import { TokenService } from '../../services/TokenService';
import { TokenPairDto } from '../../dto/auth.dto';

/**
 * Refresh-token flow orchestration.
 *
 * Verifies the provided refresh token and reissues a new token pair
 * using the verified payload.
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
