import { jest } from '@jest/globals';
import { Request, Response } from 'express';

export type RequestWithCorrelation = Request & { correlationId?: string };

export const createRequestWithHeader = (headerValue?: string): Request => {
  return {
    header: jest.fn().mockImplementation((name: string) => {
      if (name.toLowerCase() === 'x-correlation-id') {
        return headerValue;
      }

      return undefined;
    }),
  } as unknown as Request;
};

export const createResponseWithSetHeader = (): {
  res: Response;
  setHeader: ReturnType<typeof jest.fn>;
} => {
  const setHeader = jest.fn();

  return {
    res: { setHeader } as unknown as Response,
    setHeader,
  };
};
