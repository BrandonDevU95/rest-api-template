import { describe, expect, jest, test } from '@jest/globals';
import {
  CreateUserInput,
  UpdateUserInput,
} from '../../../../src/domain/interfaces/IUserRepository';

import { HashService } from '../../../../src/application/services/HashService';
import { RegisterUseCase } from '../../../../src/application/use-cases/auth/RegisterUseCase';
import { User } from '../../../../src/domain/entities/User';
import { ConflictError } from '../../../../src/shared/errors/AppError';

const buildUser = (
  overrides?: Partial<{ id: string; email: string; role: 'admin' | 'user' }>,
): User => {
  const now = new Date();
  return new User({
    id: overrides?.id ?? '99999999-9999-9999-9999-999999999999',
    email: overrides?.email ?? 'register@example.com',
    role: overrides?.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  });
};

type MockRepository = {
  findByEmail: jest.Mock<(email: string) => Promise<User | null>>;
  create: jest.Mock<(input: CreateUserInput) => Promise<User>>;
  findById: jest.Mock<(id: string) => Promise<User | null>>;
  updateById: jest.Mock<(id: string, input: UpdateUserInput) => Promise<User | null>>;
  list: jest.Mock<() => Promise<User[]>>;
  deleteById: jest.Mock<(id: string) => Promise<boolean>>;
};

const createRepositoryMock = (): MockRepository => ({
  findByEmail: jest.fn<(email: string) => Promise<User | null>>(),
  create: jest.fn<(input: CreateUserInput) => Promise<User>>(),
  findById: jest.fn<(id: string) => Promise<User | null>>(),
  updateById: jest.fn<(id: string, input: UpdateUserInput) => Promise<User | null>>(),
  list: jest.fn<() => Promise<User[]>>(),
  deleteById: jest.fn<(id: string) => Promise<boolean>>(),
});

describe('RegisterUseCase', () => {
  const hashService = new HashService();

  test('creates user with hashed password when email is available', async () => {
    const repository = createRepositoryMock();
    repository.findByEmail.mockResolvedValue(null);

    repository.create.mockImplementation(async (input) =>
      buildUser({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        email: input.email,
        role: input.role,
      }),
    );

    const useCase = new RegisterUseCase(repository, hashService);

    await expect(
      useCase.execute({
        email: 'new@example.com',
        password: 'Password123!',
      }),
    ).resolves.toMatchObject({
      email: 'new@example.com',
      role: 'user',
    });

    expect(repository.findByEmail).toHaveBeenCalledWith('new@example.com');
    expect(repository.create).toHaveBeenCalledTimes(1);

    const createdInput = repository.create.mock.calls[0][0];
    expect(createdInput.email).toBe('new@example.com');
    expect(createdInput.passwordHash).not.toBe('Password123!');
    expect(createdInput.role).toBe('user');
  });

  test('throws conflict when email already exists', async () => {
    const repository = createRepositoryMock();
    repository.findByEmail.mockResolvedValue(buildUser({ email: 'duplicate@example.com' }));

    const useCase = new RegisterUseCase(repository, hashService);

    await expect(
      useCase.execute({
        email: 'duplicate@example.com',
        password: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(repository.create).not.toHaveBeenCalled();
  });
});
