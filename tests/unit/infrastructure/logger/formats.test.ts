import { redactFormat } from '../../../../src/infrastructure/logger/formats';

describe('redactFormat', () => {
  test('redacts sensitive keys recursively in meta', () => {
    const formatter = redactFormat();
    const transformed = formatter.transform({
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

    expect(transformed).toBeDefined();
    expect((transformed as unknown as { meta: Record<string, unknown> }).meta.password).toBe(
      '[REDACTED]',
    );
    expect((transformed as unknown as { meta: Record<string, unknown> }).meta.authorization).toBe(
      '[REDACTED]',
    );

    const nested = (
      transformed as unknown as {
        meta: { nested: { refreshToken: string; array: Array<{ cookie: string }> } };
      }
    ).meta.nested;
    expect(nested.refreshToken).toBe('[REDACTED]');
    expect(nested.array[0].cookie).toBe('[REDACTED]');
  });

  test('redacts bearer and JWT patterns in string messages', () => {
    const formatter = redactFormat();
    const transformed = formatter.transform({
      level: 'info',
      message: 'Authorization: Bearer abc123 and token eyJhbGciOiJIUzI1NiJ9.payload.signature',
    });

    expect(transformed).toBeDefined();
    expect((transformed as { message: string }).message).toContain('Bearer [REDACTED]');
    expect((transformed as { message: string }).message).toContain('[REDACTED_JWT]');
    expect((transformed as { message: string }).message).not.toContain(
      'eyJhbGciOiJIUzI1NiJ9.payload.signature',
    );
  });
});
