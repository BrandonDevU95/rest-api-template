import { User } from '../../../../../src/domain/entities/User';

export const buildUser = (
  overrides?: Partial<{ id: string; email: string; role: 'admin' | 'user' }>,
): User => {
  const now = new Date();

  return new User({
    id: overrides?.id ?? '99999999-9999-9999-9999-999999999999',
    email: overrides?.email ?? 'user@example.com',
    role: overrides?.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  });
};
