import { app } from './app';
import { env } from './config/environment';
import { logger } from './infrastructure/logger/logger';
import { sequelize } from './infrastructure/database/sequelize';
import './infrastructure/database/models/UserModel';

/**
 * Application bootstrap entrypoint.
 *
 * Startup sequence:
 * 1) authenticate database connection
 * 2) start HTTP server
 * 3) log successful startup
 *
 * If bootstrap fails, the process exits with code 1.
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
