import { env } from '../../config/environment';
import { joi } from '../middlewares/validate.middleware';

const emailOptions = env.security.allowNonStandardTlds ? { tlds: { allow: false } } : undefined;

/**
 * Schemas Joi para endpoints de gestion de usuarios.
 */
export const createUserSchema = joi.object({
  email: joi.string().email(emailOptions).required(),
  password: joi.string().min(8).max(64).required(),
  role: joi.string().valid('admin', 'user').default('user'),
});

export const updateUserSchema = joi
  .object({
    email: joi.string().email(emailOptions),
    role: joi.string().valid('admin', 'user'),
  })
  .min(1);

export const idParamSchema = joi.object({
  id: joi.string().uuid().required(),
});
