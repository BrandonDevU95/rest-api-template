import { describe, expect, test } from '@jest/globals';

import { redactFormat } from '../../../../src/infrastructure/logger/formats';

type TransformedLog = {
  message: string;
  meta?: Record<string, unknown>;
};

const buildLoginAttemptLog = () => ({
  level: 'info',
  message: 'login attempt',
  meta: {
    password: 'P@ssw0rd',
    authorization: 'Bearer secret-token',
    nested: {
      refreshToken: 'abc.def.ghi',
      array: [{ cookie: 'session=123' }],
    },
  },
});

const buildMessageWithSecretsLog = () => ({
  level: 'info',
  message: 'Authorization: Bearer abc123 and token eyJhbGciOiJIUzI1NiJ9.payload.signature',
});

const asTransformedLog = (value: unknown): TransformedLog => value as TransformedLog;

describe('redactFormat', () => {
  test('redacts sensitive keys recursively in meta', () => {
    const formatter = redactFormat();
    const transformed = formatter.transform(buildLoginAttemptLog());
    const meta = asTransformedLog(transformed).meta as {
      password: string;
      authorization: string;
      nested: { refreshToken: string; array: Array<{ cookie: string }> };
    };

    expect(transformed).toBeDefined();
    expect(meta.password).toBe('[REDACTED]');
    expect(meta.authorization).toBe('[REDACTED]');
    expect(meta.nested.refreshToken).toBe('[REDACTED]');
    expect(meta.nested.array[0].cookie).toBe('[REDACTED]');
  });

  test('redacts bearer and JWT patterns in string messages', () => {
    const formatter = redactFormat();
    const transformed = formatter.transform(buildMessageWithSecretsLog());
    const message = asTransformedLog(transformed).message;

    expect(transformed).toBeDefined();
    expect(message).toContain('Bearer [REDACTED]');
    expect(message).toContain('[REDACTED_JWT]');
    expect(message).not.toContain('eyJhbGciOiJIUzI1NiJ9.payload.signature');
  });
});
