import { Sequelize } from 'sequelize';
import { env } from '../../config/environment';

/**
 * Instancia compartida de Sequelize.
 *
 * Centraliza configuracion de conexion MySQL, tamano de pool y logging SQL para que
 * el resto del codigo use una unica fuente de configuracion de base de datos.
 */
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
