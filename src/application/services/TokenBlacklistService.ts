import { env } from '../../config/environment';
import { RevokedTokenType } from '../../infrastructure/database/models/RevokedTokenModel';
import { RevokedTokenRepository } from '../../infrastructure/database/repositories/RevokedTokenRepository';

/**
 * Servicio de blacklist de tokens.
 *
 * - test: usa memoria para aislar pruebas
 * - otros entornos: persiste en BD
 */
export class TokenBlacklistService {
  private readonly repository = new RevokedTokenRepository();
  private readonly inMemory = new Set<string>();

  /**
   * Revoca un jti hasta su expiracion.
   */
  async addToBlacklist(jti: string, tokenType: RevokedTokenType, expiresAt: Date): Promise<void> {
    if (env.nodeEnv === 'test') {
      this.inMemory.add(jti);
      return;
    }

    await this.repository.revokeToken(jti, tokenType, expiresAt);
  }

  /**
   * Verifica si el jti ya fue revocado.
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    if (env.nodeEnv === 'test') {
      return this.inMemory.has(jti);
    }

    return this.repository.isRevoked(jti);
  }

  /**
   * Elimina revocaciones expiradas y retorna cuantas entradas removio.
   */
  async cleanupExpired(now = new Date()): Promise<number> {
    if (env.nodeEnv === 'test') {
      const size = this.inMemory.size;
      this.inMemory.clear();
      return size;
    }

    return this.repository.cleanupExpired(now);
  }

  /**
   * Utilidad para limpiar estado en pruebas.
   */
  clear(): void {
    this.inMemory.clear();
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
