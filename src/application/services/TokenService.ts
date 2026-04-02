import jwt from 'jsonwebtoken';
import { env } from '../../config/environment';
import { JwtPayload, TokenPairDto } from '../dto/auth.dto';

/**
 * JWT token service.
 *
 * Encapsulates signing and verification for access/refresh tokens and
 * provides a single place for payload shape and expiry policy.
 */
export class TokenService {
  signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
  }

  createTokenPair(payload: JwtPayload): TokenPairDto {
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }
}
