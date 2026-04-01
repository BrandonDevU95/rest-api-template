import { Sequelize } from 'sequelize';
import { env } from '../../config/environment';

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.db.logging,
  pool: {
    min: 1,
    max: 10,
    idle: 10000,
    acquire: 30000,
  },
});
