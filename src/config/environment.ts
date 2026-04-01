import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('/api/v1'),
  APP_NAME: Joi.string().default('api-backend-boilerplate'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_LOGGING: Joi.boolean().default(false),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  BCRYPT_SALT_ROUNDS: Joi.number().min(8).max(15).default(12),

  CORS_ORIGIN: Joi.string().required(),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
  LOG_DIR: Joi.string().default('logs'),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  RATE_LIMIT_LOGIN_MAX_REQUESTS: Joi.number().default(10),
}).unknown();

const { value, error } = envSchema.validate(process.env, {
  allowUnknown: true,
  abortEarly: false,
  convert: true,
});

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const env = {
  nodeEnv: value.NODE_ENV as 'development' | 'test' | 'production',
  isProduction: value.NODE_ENV === 'production',
  isDevelopment: value.NODE_ENV === 'development',

  app: {
    name: value.APP_NAME as string,
    port: value.PORT as number,
    apiPrefix: value.API_PREFIX as string,
  },

  db: {
    host: value.DB_HOST as string,
    port: value.DB_PORT as number,
    name: value.DB_NAME as string,
    user: value.DB_USER as string,
    password: value.DB_PASSWORD as string,
    logging: value.DB_LOGGING as boolean,
  },

  jwt: {
    accessSecret: value.JWT_ACCESS_SECRET as string,
    accessExpiresIn: value.JWT_ACCESS_EXPIRES_IN as string,
    refreshSecret: value.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: value.JWT_REFRESH_EXPIRES_IN as string,
  },

  security: {
    bcryptSaltRounds: value.BCRYPT_SALT_ROUNDS as number,
    corsOrigins: (value.CORS_ORIGIN as string).split(',').map((origin) => origin.trim()),
    rateLimitWindowMs: value.RATE_LIMIT_WINDOW_MS as number,
    rateLimitMaxRequests: value.RATE_LIMIT_MAX_REQUESTS as number,
    rateLimitLoginMaxRequests: value.RATE_LIMIT_LOGIN_MAX_REQUESTS as number,
  },

  log: {
    level: value.LOG_LEVEL as string,
    dir: value.LOG_DIR as string,
  },
};
