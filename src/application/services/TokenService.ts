import { JwtPayload, TokenPairDto } from '../dto/auth.dto';

import { env } from '../../config/environment';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio de tokens JWT.
 *
 * Encapsula firmado y verificacion de tokens access/refresh y
 * provee un solo lugar para la forma del payload y la politica de expiracion.
 */
export class TokenService {
  private readonly tokenOptions = {
    issuer: env.app.slug,
    audience: env.app.slug,
    algorithms: ['HS256'] as jwt.Algorithm[],
  };

  signAccessToken(payload: JwtPayload): string {
    return jwt.sign({ ...payload, jti: uuidv4() }, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
      issuer: env.app.slug,
      audience: env.app.slug,
    });
  }

  signRefreshToken(payload: JwtPayload): string {
    return jwt.sign({ ...payload, jti: uuidv4() }, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
      issuer: env.app.slug,
      audience: env.app.slug,
    });
  }

  verifyAccessToken(token: string): JwtPayload & { jti?: string; exp?: number } {
    return jwt.verify(token, env.jwt.accessSecret, this.tokenOptions) as JwtPayload & { jti?: string; exp?: number };
  }

  verifyRefreshToken(token: string): JwtPayload & { jti?: string; exp?: number } {
    return jwt.verify(token, env.jwt.refreshSecret, this.tokenOptions) as JwtPayload & { jti?: string; exp?: number };
  }

  createTokenPair(payload: JwtPayload): TokenPairDto {
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }
}
