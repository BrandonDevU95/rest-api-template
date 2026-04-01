import { app } from './app';
import { env } from './config/environment';
import { logger } from './infrastructure/logger/logger';
import { sequelize } from './infrastructure/database/sequelize';
import './infrastructure/database/models/UserModel';

const bootstrap = async (): Promise<void> => {
  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(env.app.port, () => {
    logger.info(`${env.app.name} running on port ${env.app.port} (${env.nodeEnv})`);
  });
};

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap application', { meta: { error } });
  process.exit(1);
});
