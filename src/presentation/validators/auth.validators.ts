import { env } from '../../config/environment';
import { joi } from '../middlewares/validate.middleware';

const emailOptions = env.security.allowNonStandardTlds ? { tlds: { allow: false } } : undefined;
const passwordComplexityPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/;
const jwtTokenPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

const registrationPasswordSchema = joi
  .string()
  .min(12)
  .max(64)
  .pattern(passwordComplexityPattern)
  .required();

const jwtTokenSchema = joi.string().max(4096).pattern(jwtTokenPattern);

/**
 * Schemas Joi para endpoints de autenticacion.
 */
export const registerSchema = joi.object({
  email: joi.string().email(emailOptions).required(),
  password: registrationPasswordSchema,
});

export const loginSchema = joi.object({
  email: joi.string().email(emailOptions).required(),
  password: registrationPasswordSchema,
});

export const refreshSchema = joi.object({
  refreshToken: jwtTokenSchema.required(),
});

export const logoutSchema = joi.object({
  refreshToken: jwtTokenSchema.optional(),
});
