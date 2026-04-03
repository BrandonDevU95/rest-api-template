import { HashService } from '../../../../src/application/services/HashService';
import { TokenService } from '../../../../src/application/services/TokenService';
import { RegisterUseCase } from '../../../../src/application/use-cases/auth/RegisterUseCase';
import { User } from '../../../../src/domain/entities/User';
import { ConflictError } from '../../../../src/shared/errors/AppError';

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
  const tokenService = new TokenService();

  test('creates user with hashed password and returns token pair', async () => {
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

    const useCase = new RegisterUseCase(repository, hashService, tokenService);

    const tokens = await useCase.execute({
      email: 'new@example.com',
      password: 'Password123!',
    });

    expect(repository.findByEmail).toHaveBeenCalledWith('new@example.com');
    expect(repository.create).toHaveBeenCalledTimes(1);

    const createdInput = repository.create.mock.calls[0][0];
    expect(createdInput.email).toBe('new@example.com');
    expect(createdInput.passwordHash).not.toBe('Password123!');
    expect(createdInput.role).toBe('user');

    const accessPayload = tokenService.verifyAccessToken(tokens.accessToken);
    expect(accessPayload.sub).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    expect(accessPayload.email).toBe('new@example.com');
    expect(accessPayload.role).toBe('user');
  });

  test('throws ConflictError when email already exists', async () => {
    const repository = {
      findByEmail: jest.fn().mockResolvedValue(buildUser({ email: 'duplicate@example.com' })),
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      list: jest.fn(),
      deleteById: jest.fn(),
    };

    const useCase = new RegisterUseCase(repository, hashService, tokenService);

    await expect(
      useCase.execute({
        email: 'duplicate@example.com',
        password: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(repository.create).not.toHaveBeenCalled();
  });
});
