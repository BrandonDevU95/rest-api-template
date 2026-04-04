import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cargador de configuracion de entorno.
 *
 * Valida todas las variables de runtime requeridas al iniciar y exporta un
 * objeto de configuracion tipado usado en toda la aplicacion.
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
  PORT: Joi.number().required(),
  API_PREFIX: Joi.string().required(),
  PROJECT_SLUG: Joi.string().pattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/).required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_LOGGING: Joi.boolean().required(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

  BCRYPT_SALT_ROUNDS: Joi.number().min(8).max(15).required(),

  CORS_ORIGIN: Joi.string().required(),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').required(),
  LOG_DIR: Joi.string().required(),

  RATE_LIMIT_WINDOW_MS: Joi.number().required(),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().required(),
  RATE_LIMIT_LOGIN_MAX_REQUESTS: Joi.number().required(),
  RATE_LIMIT_REGISTER_MAX_REQUESTS: Joi.number().default(10),
  TOKEN_BLACKLIST_CLEANUP_INTERVAL_MS: Joi.number().integer().min(60000).default(3600000),
  TRUST_PROXY_HOPS: Joi.number().integer().min(0).default(0),
  ALLOW_NON_STANDARD_TLDS: Joi.boolean().default(true),
  ENABLE_PUBLIC_DOCS: Joi.boolean().optional(),
}).unknown();

const { value, error } = envSchema.validate(process.env, {
  allowUnknown: true,
  abortEarly: false,
  convert: true,
});

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

const assertStrongJwtSecret = (secret: string, variableName: string): void => {
  if (!value.NODE_ENV || value.NODE_ENV !== 'production') {
    return;
  }

  if (secret.length < 32) {
    throw new Error(`${variableName} must be at least 32 characters in production`);
  }

  if (/change_this|example|default|template/i.test(secret)) {
    throw new Error(`${variableName} contains an unsafe placeholder value`);
  }
};

assertStrongJwtSecret(value.JWT_ACCESS_SECRET as string, 'JWT_ACCESS_SECRET');
assertStrongJwtSecret(value.JWT_REFRESH_SECRET as string, 'JWT_REFRESH_SECRET');

const projectSlug = value.PROJECT_SLUG as string;
const toTitleFromSlug = (slug: string): string =>
  slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

const appName = toTitleFromSlug(projectSlug);
const appDescription = `${appName} API`;
const enablePublicDocs =
  value.ENABLE_PUBLIC_DOCS === undefined
    ? value.NODE_ENV !== 'production'
    : (value.ENABLE_PUBLIC_DOCS as boolean);

export const env = {
  nodeEnv: value.NODE_ENV as 'development' | 'test' | 'production',
  isProduction: value.NODE_ENV === 'production',
  isDevelopment: value.NODE_ENV === 'development',

  app: {
    slug: projectSlug,
    name: appName,
    description: appDescription,
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
    trustProxyHops: value.TRUST_PROXY_HOPS as number,
    bcryptSaltRounds: value.BCRYPT_SALT_ROUNDS as number,
    corsOrigins: (value.CORS_ORIGIN as string).split(',').map((origin) => origin.trim()),
    rateLimitWindowMs: value.RATE_LIMIT_WINDOW_MS as number,
    rateLimitMaxRequests: value.RATE_LIMIT_MAX_REQUESTS as number,
    rateLimitLoginMaxRequests: value.RATE_LIMIT_LOGIN_MAX_REQUESTS as number,
    rateLimitRegisterMaxRequests: value.RATE_LIMIT_REGISTER_MAX_REQUESTS as number,
    tokenBlacklistCleanupIntervalMs: value.TOKEN_BLACKLIST_CLEANUP_INTERVAL_MS as number,
    allowNonStandardTlds: value.ALLOW_NON_STANDARD_TLDS as boolean,
  },

  log: {
    level: value.LOG_LEVEL as string,
    dir: value.LOG_DIR as string,
  },

  docs: {
    enablePublicDocs,
  },
};
