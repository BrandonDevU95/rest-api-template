import { HashService } from '../../../../src/application/services/HashService';
import { RegisterUseCase } from '../../../../src/application/use-cases/auth/RegisterUseCase';
import { ConflictError } from '../../../../src/shared/errors/AppError';
import { User } from '../../../../src/domain/entities/User';

const buildUser = (overrides?: Partial<{ id: string; email: string; role: 'admin' | 'user' }>): User => {
  const now = new Date();
  return new User({
    id: overrides?.id ?? '99999999-9999-9999-9999-999999999999',
    email: overrides?.email ?? 'register@example.com',
    passwordHash: overrides?.passwordHash ?? '$2b$12$JSE3mkuN8RwdFfQf7rxk8e4QwPwFsEYh3YOEoTP0TO.GfYh3CX6Ka',
    role: overrides?.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  });
};

describe('RegisterUseCase', () => {
  const hashService = new HashService();

  test('creates user with hashed password when email is available', async () => {
    const repository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      list: jest.fn(),
      deleteById: jest.fn(),
    };

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
    const repository = {
      findByEmail: jest.fn().mockResolvedValue(buildUser({ email: 'duplicate@example.com' })),
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      list: jest.fn(),
      deleteById: jest.fn(),
    };

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
