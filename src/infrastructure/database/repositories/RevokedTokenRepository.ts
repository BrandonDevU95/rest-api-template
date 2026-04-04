import { Op } from 'sequelize';
import { RevokedTokenModel, RevokedTokenType } from '../models/RevokedTokenModel';

/**
 * Persistencia de JTIs revocados.
 */
export class RevokedTokenRepository {
  async revokeToken(jti: string, tokenType: RevokedTokenType, expiresAt: Date): Promise<void> {
    await RevokedTokenModel.upsert({ jti, tokenType, expiresAt });
  }

  async isRevoked(jti: string): Promise<boolean> {
    const revoked = await RevokedTokenModel.findByPk(jti);
    return Boolean(revoked);
  }

  async cleanupExpired(now = new Date()): Promise<number> {
    return RevokedTokenModel.destroy({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });
  }
}
