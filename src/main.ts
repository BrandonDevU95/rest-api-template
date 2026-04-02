import { app } from './app';
import { env } from './config/environment';
import { logger } from './infrastructure/logger/logger';
import { sequelize } from './infrastructure/database/sequelize';
import './infrastructure/database/models/UserModel';

/**
 * Punto de entrada del bootstrap de la aplicacion.
 *
 * Secuencia de arranque:
 * 1) autenticar conexion a base de datos
 * 2) iniciar servidor HTTP
 * 3) registrar arranque exitoso
 *
 * Si el bootstrap falla, el proceso termina con codigo 1.
 */
const bootstrap = async (): Promise<void> => {
  await sequelize.authenticate();

  app.listen(env.app.port, () => {
    logger.info(`${env.app.name} running on port ${env.app.port} (${env.nodeEnv})`);
  });
};

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap application', { meta: { error } });
  process.exit(1);
});
