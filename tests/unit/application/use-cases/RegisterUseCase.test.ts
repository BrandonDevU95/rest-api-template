import { describe, expect, test } from '@jest/globals';

import { HashService } from '../../../../src/application/services/HashService';
import { RegisterUseCase } from '../../../../src/application/use-cases/auth/RegisterUseCase';
import { ConflictError } from '../../../../src/shared/errors/AppError';
import { buildUser } from './support/user.fixture';
import { createMockUserRepository } from './support/userRepository.mock';

describe('RegisterUseCase', () => {
  const hashService = new HashService();

  test('creates user with hashed password when email is available', async () => {
    const repository = createMockUserRepository();
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
    const repository = createMockUserRepository();
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
