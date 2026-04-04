import { JwtPayload, TokenPairDto } from '../dto/auth.dto';

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/environment';

type VerifiedTokenPayload = JwtPayload & {
  jti?: string;
  exp?: number;
  tokenType?: 'access' | 'refresh';
};

/**
 * Servicio de tokens JWT.
 *
 * Encapsula firmado y verificacion de tokens access/refresh y
 * provee un solo lugar para la forma del payload y la politica de expiracion.
 */
export class TokenService {
  private readonly issuer = env.app.slug;
  private readonly accessAudience = `${env.app.slug}:access`;
  private readonly refreshAudience = `${env.app.slug}:refresh`;

  /**
   * Firma access token con claims de control (jti y tokenType).
   */
  signAccessToken(payload: JwtPayload): string {
    return jwt.sign({ ...payload, jti: uuidv4(), tokenType: 'access' }, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
      issuer: this.issuer,
      audience: this.accessAudience,
    });
  }

  /**
   * Firma refresh token con claims de control (jti y tokenType).
   */
  signRefreshToken(payload: JwtPayload): string {
    return jwt.sign({ ...payload, jti: uuidv4(), tokenType: 'refresh' }, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
      issuer: this.issuer,
      audience: this.refreshAudience,
    });
  }

  /**
   * Verifica firma y claims de access token.
   */
  verifyAccessToken(token: string): VerifiedTokenPayload {
    const decoded = jwt.verify(token, env.jwt.accessSecret, {
      issuer: this.issuer,
      audience: this.accessAudience,
      algorithms: ['HS256'],
    }) as VerifiedTokenPayload;

    if (decoded.tokenType !== 'access') {
      throw new jwt.JsonWebTokenError('Invalid token type');
    }

    return decoded;
  }

  /**
   * Verifica firma y claims de refresh token.
   */
  verifyRefreshToken(token: string): VerifiedTokenPayload {
    const decoded = jwt.verify(token, env.jwt.refreshSecret, {
      issuer: this.issuer,
      audience: this.refreshAudience,
      algorithms: ['HS256'],
    }) as VerifiedTokenPayload;

    if (decoded.tokenType !== 'refresh') {
      throw new jwt.JsonWebTokenError('Invalid token type');
    }

    return decoded;
  }

  /**
   * Crea un par access/refresh usando el mismo payload de identidad.
   */
  createTokenPair(payload: JwtPayload): TokenPairDto {
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }
}
