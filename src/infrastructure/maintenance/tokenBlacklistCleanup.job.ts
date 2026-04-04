import { env } from '../../config/environment';
import { tokenBlacklistService } from '../../application/services/TokenBlacklistService';
import { logger } from '../logger/logger';

/**
 * Job periodico de limpieza de tokens revocados expirados.
 */
export class TokenBlacklistCleanupJob {
  private intervalHandle: NodeJS.Timeout | null = null;

  start(): void {
    if (this.intervalHandle) {
      return;
    }

    void this.runOnce();
    this.intervalHandle = setInterval(() => {
      void this.runOnce();
    }, env.security.tokenBlacklistCleanupIntervalMs);

    this.intervalHandle.unref?.();
  }

  async runOnce(): Promise<void> {
    try {
      const removedCount = await tokenBlacklistService.cleanupExpired();
      if (removedCount > 0) {
        logger.info('Expired revoked tokens cleaned up', {
          meta: {
            removedCount,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to clean expired revoked tokens', {
        meta: {
          error,
        },
      });
    }
  }

  stop(): void {
    if (!this.intervalHandle) {
      return;
    }

    clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }
}

export const tokenBlacklistCleanupJob = new TokenBlacklistCleanupJob();
