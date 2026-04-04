import { NextFunction, Request, Response } from 'express';

import { requestContext } from '../../../../src/infrastructure/logger/requestContext.middleware';

type RequestWithCorrelation = Request & { correlationId?: string };

const createReq = (headerValue?: string): Request => {
  return {
    header: jest.fn().mockImplementation((name: string) => {
      if (name.toLowerCase() === 'x-correlation-id') {
        return headerValue;
      }
      return undefined;
    }),
  } as unknown as Request;
};

const createRes = () => {
  const setHeader = jest.fn();
  return {
    res: { setHeader } as unknown as Response,
    setHeader,
  };
};

describe('requestContext middleware', () => {
  test('accepts valid incoming correlation id', () => {
    const req = createReq('trace-123:abc_DEF') as RequestWithCorrelation;
    const { res, setHeader } = createRes();
    const next: NextFunction = jest.fn();

    requestContext(req, res, next);

    expect(req.correlationId).toBe('trace-123:abc_DEF');
    expect(setHeader).toHaveBeenCalledWith('x-correlation-id', 'trace-123:abc_DEF');
    expect(next).toHaveBeenCalled();
  });

  test('replaces invalid incoming correlation id with generated uuid', () => {
    const req = createReq('bad\nvalue') as RequestWithCorrelation;
    const { res, setHeader } = createRes();
    const next: NextFunction = jest.fn();

    requestContext(req, res, next);

    expect(req.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(setHeader).toHaveBeenCalledWith('x-correlation-id', req.correlationId);
    expect(next).toHaveBeenCalled();
  });
});
