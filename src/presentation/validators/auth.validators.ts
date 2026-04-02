import { joi } from '../middlewares/validate.middleware';

/**
 * Schemas Joi para endpoints de autenticacion.
 */
export const registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).max(64).required(),
});

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const refreshSchema = joi.object({
  refreshToken: joi.string().required(),
});
