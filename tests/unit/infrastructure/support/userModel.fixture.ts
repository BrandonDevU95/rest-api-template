import { jest } from '@jest/globals';
import { UserModel } from '../../../../src/infrastructure/database/models/UserModel';

export const buildUserModelLike = (overrides?: Partial<Record<string, unknown>>): UserModel => {
  const now = new Date();

  return {
    id: overrides?.id ?? '11111111-1111-1111-1111-111111111111',
    email: overrides?.email ?? 'normalized@example.com',
    role: overrides?.role ?? 'user',
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
    getDataValue: jest
      .fn<(key: string) => string>()
      .mockReturnValue(String(overrides?.passwordHash ?? '$2b$12$hash')),
    update: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  } as unknown as UserModel;
};
