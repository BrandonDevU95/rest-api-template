import { env } from '../../config/environment';
import { RevokedTokenRepository } from '../../infrastructure/database/repositories/RevokedTokenRepository';
import { RevokedTokenType } from '../../infrastructure/database/models/RevokedTokenModel';

/**
 * Servicio de blacklist de tokens.
 *
 * - test: usa memoria para aislar pruebas
 * - otros entornos: persiste en BD
 */
export class TokenBlacklistService {
  private readonly repository = new RevokedTokenRepository();
  private readonly inMemory = new Set<string>();

  async addToBlacklist(jti: string, tokenType: RevokedTokenType, expiresAt: Date): Promise<void> {
    if (env.nodeEnv === 'test') {
      this.inMemory.add(jti);
      return;
    }

    await this.repository.revokeToken(jti, tokenType, expiresAt);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    if (env.nodeEnv === 'test') {
      return this.inMemory.has(jti);
    }

    return this.repository.isRevoked(jti);
  }

  async cleanupExpired(now = new Date()): Promise<number> {
    if (env.nodeEnv === 'test') {
      const size = this.inMemory.size;
      this.inMemory.clear();
      return size;
    }

    return this.repository.cleanupExpired(now);
  }

  clear(): void {
    this.inMemory.clear();
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
