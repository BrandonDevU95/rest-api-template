import { NextFunction } from 'express';

import { requestContext } from '../../../../src/infrastructure/logger/requestContext.middleware';
import {
  createRequestWithHeader,
  createResponseWithSetHeader,
  RequestWithCorrelation,
} from '../support/express.mock';

describe('requestContext middleware', () => {
  test('accepts valid incoming correlation id', () => {
    const req = createRequestWithHeader('trace-123:abc_DEF') as RequestWithCorrelation;
    const { res, setHeader } = createResponseWithSetHeader();
    const next: NextFunction = jest.fn();

    requestContext(req, res, next);

    expect(req.correlationId).toBe('trace-123:abc_DEF');
    expect(setHeader).toHaveBeenCalledWith('x-correlation-id', 'trace-123:abc_DEF');
    expect(next).toHaveBeenCalled();
  });

  test('replaces invalid incoming correlation id with generated uuid', () => {
    const req = createRequestWithHeader('bad\nvalue') as RequestWithCorrelation;
    const { res, setHeader } = createResponseWithSetHeader();
    const next: NextFunction = jest.fn();

    requestContext(req, res, next);

    expect(req.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(setHeader).toHaveBeenCalledWith('x-correlation-id', req.correlationId);
    expect(next).toHaveBeenCalled();
  });
});
