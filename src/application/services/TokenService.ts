import jwt from 'jsonwebtoken';
import { env } from '../../config/environment';
import { JwtPayload, TokenPairDto } from '../dto/auth.dto';

/**
 * Servicio de tokens JWT.
 *
 * Encapsula firmado y verificacion de tokens access/refresh y
 * provee un solo lugar para la forma del payload y la politica de expiracion.
 */
export class TokenService {
  signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    });
  }

  signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
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
