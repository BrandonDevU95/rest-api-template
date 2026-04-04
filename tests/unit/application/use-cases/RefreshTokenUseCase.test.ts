import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
  CreateUserInput,
  UpdateUserInput,
} from '../../../../src/domain/interfaces/IUserRepository';

import { tokenBlacklistService } from '../../../../src/application/services/TokenBlacklistService';
import { TokenService } from '../../../../src/application/services/TokenService';
import { RefreshTokenUseCase } from '../../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { User } from '../../../../src/domain/entities/User';
import { UnauthorizedError } from '../../../../src/shared/errors/AppError';

const buildUser = (id: string, email: string, role: 'admin' | 'user'): User => {
  const now = new Date();
  return new User({
    id,
    email,
    role,
    createdAt: now,
    updatedAt: now,
  });
};

type MockRepository = {
  findById: jest.Mock<(id: string) => Promise<User | null>>;
  findByEmail: jest.Mock<(email: string) => Promise<User | null>>;
  create: jest.Mock<(input: CreateUserInput) => Promise<User>>;
  updateById: jest.Mock<(id: string, input: UpdateUserInput) => Promise<User | null>>;
  list: jest.Mock<() => Promise<User[]>>;
  deleteById: jest.Mock<(id: string) => Promise<boolean>>;
};

const createRepositoryMock = (): MockRepository => ({
  findById: jest.fn<(id: string) => Promise<User | null>>(),
  findByEmail: jest.fn<(email: string) => Promise<User | null>>(),
  create: jest.fn<(input: CreateUserInput) => Promise<User>>(),
  updateById: jest.fn<(id: string, input: UpdateUserInput) => Promise<User | null>>(),
  list: jest.fn<() => Promise<User[]>>(),
  deleteById: jest.fn<(id: string) => Promise<boolean>>(),
});

describe('RefreshTokenUseCase', () => {
  const tokenService = new TokenService();

  beforeEach(() => {
    tokenBlacklistService.clear();
  });

  test('returns token pair when refresh token is valid', async () => {
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValue(
      buildUser('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'refresh.use.case@example.com', 'admin'),
    );

    const useCase = new RefreshTokenUseCase(tokenService, repository);
    const original = tokenService.createTokenPair({
      sub: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      email: 'refresh.use.case@example.com',
      role: 'admin',
    });

    const refreshed = await useCase.execute(original.refreshToken);

    const payload = tokenService.verifyAccessToken(refreshed.accessToken);
    expect(payload.sub).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    expect(payload.email).toBe('refresh.use.case@example.com');
    expect(payload.role).toBe('admin');
  });

  test('throws UnauthorizedError for invalid refresh token', async () => {
    const repository = createRepositoryMock();

    const useCase = new RefreshTokenUseCase(tokenService, repository);

    await expect(useCase.execute('invalid.refresh.token')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  test('revokes used refresh token and rejects replay', async () => {
    const userId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    const email = 'single.use.refresh@example.com';
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValue(buildUser(userId, email, 'user'));

    const useCase = new RefreshTokenUseCase(tokenService, repository);
    const pair = tokenService.createTokenPair({
      sub: userId,
      email,
      role: 'user',
    });

    await expect(useCase.execute(pair.refreshToken)).resolves.toBeDefined();
    await expect(useCase.execute(pair.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
