import { describe, expect, test } from '@jest/globals';

import { HashService } from '../../../../src/application/services/HashService';

describe('HashService', () => {
  const service = new HashService();

  test('hash generates a digest that differs from the plain text', async () => {
    const plain = 'Password123!';

    const digest = await service.hash(plain);

    expect(digest).not.toBe(plain);
    expect(typeof digest).toBe('string');
    expect(digest.length).toBeGreaterThan(20);
  });

  test('compare returns true for matching password and false otherwise', async () => {
    const digest = await service.hash('Password123!');

    await expect(service.compare('Password123!', digest)).resolves.toBe(true);
    await expect(service.compare('WrongPassword123!', digest)).resolves.toBe(false);
  });
});
