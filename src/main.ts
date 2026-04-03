import { app } from './app';
import { env } from './config/environment';
import { logger } from './infrastructure/logger/logger';
import { sequelize } from './infrastructure/database/sequelize';
import './infrastructure/database/models/UserModel';
import { tokenBlacklistCleanupJob } from './infrastructure/maintenance/tokenBlacklistCleanup.job';

/**
 * Punto de entrada del bootstrap de la aplicacion.
 *
 * Secuencia de arranque:
 * 1) autenticar conexion a base de datos
 * 2) iniciar servidor HTTP
 * 3) arrancar tareas de mantenimiento
 * 4) registrar arranque exitoso
 *
 * Si el bootstrap falla, el proceso termina con codigo 1.
 */
const bootstrap = async (): Promise<void> => {
  await sequelize.authenticate();

  const server = app.listen(env.app.port, () => {
    logger.info(`${env.app.name} running on port ${env.app.port} (${env.nodeEnv})`);
  });

  tokenBlacklistCleanupJob.start();

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    tokenBlacklistCleanupJob.stop();

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });

    await sequelize.close();
    process.exit(0);
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap application', { meta: { error } });
  process.exit(1);
});
