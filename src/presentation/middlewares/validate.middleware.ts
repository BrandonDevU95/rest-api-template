import { NextFunction, Request, Response } from 'express';
import Joi, { Schema } from 'joi';
import { ValidationError } from '../../shared/errors/AppError';

/**
 * Request validation middleware factory.
 *
 * Applies Joi schemas to body/query/params with:
 * - abortEarly: false (collect all validation errors)
 * - stripUnknown: true (remove undeclared fields)
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
    stripUnknown: true,
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
