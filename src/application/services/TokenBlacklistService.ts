import { TokenService } from './TokenService';

/**
 * Servicio de blacklist de tokens en memoria.
 *
 * En produccion, esto deberia persistirse en una tabla o cache compartida.
 */
export class TokenBlacklistService {
  private readonly blacklist = new Set<string>();

  addToBlacklist(jti: string): void {
    this.blacklist.add(jti);
  }

  isBlacklisted(jti: string): boolean {
    return this.blacklist.has(jti);
  }

  clear(): void {
    this.blacklist.clear();
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
