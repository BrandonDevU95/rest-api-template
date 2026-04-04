import { afterEach, describe, expect, jest, test } from '@jest/globals';

import { UserModel } from '../../../../../src/infrastructure/database/models/UserModel';
import { UserRepository } from '../../../../../src/infrastructure/database/repositories/UserRepository';

const buildModelLike = (overrides?: Partial<Record<string, unknown>>): UserModel => {
  const now = new Date();
  const modelLike = {
    id: overrides?.id ?? '11111111-1111-1111-1111-111111111111',
    email: overrides?.email ?? 'normalized@example.com',
    role: overrides?.role ?? 'user',
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
    getDataValue: jest
      .fn<(key: string) => string>()
      .mockReturnValue(String(overrides?.passwordHash ?? '$2b$12$hash')),
    update: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };

  return modelLike as unknown as UserModel;
};

describe('UserRepository email normalization', () => {
  const repository = new UserRepository();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('normalizes email in findByEmail', async () => {
    const spy = jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(buildModelLike());

    await repository.findByEmail('  USER@Example.COM  ');

    expect(spy).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
  });

  test('normalizes email in findByEmailForAuth', async () => {
    const findOne = jest
      .fn<() => Promise<UserModel | null>>()
      .mockResolvedValue(buildModelLike({ passwordHash: '$2b$12$authhash' }));
    jest.spyOn(UserModel, 'unscoped').mockReturnValue({ findOne } as unknown as typeof UserModel);

    await repository.findByEmailForAuth('  USER@Example.COM  ');

    expect(findOne).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
  });

  test('normalizes email in create', async () => {
    const spy = jest
      .spyOn(UserModel, 'create')
      .mockResolvedValueOnce(buildModelLike({ email: 'user@example.com' }));

    await repository.create({
      email: '  USER@Example.COM  ',
      passwordHash: '$2b$12$hash',
      role: 'user',
    });

    expect(spy).toHaveBeenCalledWith({
      email: 'user@example.com',
      passwordHash: '$2b$12$hash',
      role: 'user',
    });
  });

  test('normalizes email in updateById when present', async () => {
    const model = buildModelLike();
    jest.spyOn(UserModel, 'findByPk').mockResolvedValueOnce(model);

    await repository.updateById('11111111-1111-1111-1111-111111111111', {
      email: '  USER@Example.COM  ',
      role: 'admin',
    });

    expect(
      (model as unknown as { update: ReturnType<typeof jest.fn> }).update,
    ).toHaveBeenCalledWith({
      email: 'user@example.com',
      role: 'admin',
    });
  });
});
