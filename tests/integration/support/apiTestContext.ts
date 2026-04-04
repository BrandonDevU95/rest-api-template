import { AuthUser, User, UserRole } from '../../../src/domain/entities/User';
import { CreateUserInput, UpdateUserInput } from '../../../src/domain/interfaces/IUserRepository';

import { jest } from '@jest/globals';
import { HashService } from '../../../src/application/services/HashService';
import { tokenBlacklistService } from '../../../src/application/services/TokenBlacklistService';
import { TokenService } from '../../../src/application/services/TokenService';

export type MockUserRepository = {
  findByEmail: jest.Mock<(email: string) => Promise<User | null>>;
  findByEmailForAuth: jest.Mock<(email: string) => Promise<AuthUser | null>>;
  create: jest.Mock<(input: CreateUserInput) => Promise<User>>;
  findById: jest.Mock<(id: string) => Promise<User | null>>;
  updateById: jest.Mock<(id: string, input: UpdateUserInput) => Promise<User | null>>;
  list: jest.Mock<() => Promise<User[]>>;
  deleteById: jest.Mock<(id: string) => Promise<boolean>>;
};

export const mockUserRepository: MockUserRepository = {
  findByEmail: jest.fn<(email: string) => Promise<User | null>>(),
  findByEmailForAuth: jest.fn<(email: string) => Promise<AuthUser | null>>(),
  create: jest.fn<(input: CreateUserInput) => Promise<User>>(),
  findById: jest.fn<(id: string) => Promise<User | null>>(),
  updateById: jest.fn<(id: string, input: UpdateUserInput) => Promise<User | null>>(),
  list: jest.fn<() => Promise<User[]>>(),
  deleteById: jest.fn<(id: string) => Promise<boolean>>(),
};

jest.mock('../../../src/infrastructure/database/repositories/UserRepository', () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
export const { app } = require('../../../src/app');

export const hashService = new HashService();
export const tokenService = new TokenService();

export const buildUser = (
  overrides?: Partial<{
    id: string;
    email: string;
    role: UserRole;
  }>,
): User => {
  const now = new Date();
  return new User({
    id: overrides?.id ?? '11111111-1111-1111-1111-111111111111',
    email: overrides?.email ?? 'user@example.com',
    role: overrides?.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  });
};

export const buildAuthUser = (
  overrides?: Partial<{ id: string; email: string; passwordHash: string; role: UserRole }>,
): AuthUser => {
  const now = new Date();
  return new AuthUser({
    id: overrides?.id ?? '11111111-1111-1111-1111-111111111111',
    email: overrides?.email ?? 'user@example.com',
    passwordHash:
      overrides?.passwordHash ?? '$2b$12$JSE3mkuN8RwdFfQf7rxk8e4QwPwFsEYh3YOEoTP0TO.GfYh3CX6Ka',
    role: overrides?.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  });
};

export const resetIntegrationState = (): void => {
  Object.values(mockUserRepository).forEach((fn) => fn.mockReset());
  tokenBlacklistService.clear();
};
