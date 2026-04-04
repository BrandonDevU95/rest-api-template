import { NextFunction, Request, Response } from 'express';
import Joi, { Schema } from 'joi';
import { ValidationError } from '../../shared/errors/AppError';

/**
 * Fabrica de middlewares de validacion de requests.
 *
 * Aplica schemas Joi a body/query/params con:
 * - abortEarly: false (recopila todos los errores de validacion)
 * - stripUnknown: false (rechaza campos no declarados)
 * - convert: false (evita coercion implicita de tipos)
 */
interface ValidationSchemas {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}

const validateObject = (schema: Schema | undefined, value: unknown): unknown => {
  if (!schema) {
    return value;
  }

  const result = schema.validate(value, {
    abortEarly: false,
    stripUnknown: false,
    convert: false,
  });

  if (result.error) {
    throw new ValidationError('Request validation failed', {
      errors: result.error.details.map((detail) => detail.message),
    });
  }

  return result.value;
};

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = validateObject(schemas.body, req.body);
    req.query = validateObject(schemas.query, req.query) as Request['query'];
    req.params = validateObject(schemas.params, req.params) as Request['params'];
    next();
  };
};

export const joi = Joi;

