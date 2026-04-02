import { env } from '../../config/environment';
import { joi } from '../middlewares/validate.middleware';

const emailOptions = env.security.allowNonStandardTlds ? { tlds: { allow: false } } : undefined;

/**
 * Schemas Joi para endpoints de autenticacion.
 */
export const registerSchema = joi.object({
  email: joi.string().email(emailOptions).required(),
  password: joi.string().min(8).max(64).required(),
});

export const loginSchema = joi.object({
  email: joi.string().email(emailOptions).required(),
  password: joi.string().required(),
});

export const refreshSchema = joi.object({
  refreshToken: joi.string().required(),
});
