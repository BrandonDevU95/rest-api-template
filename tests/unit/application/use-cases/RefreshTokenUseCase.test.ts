import { beforeEach, describe, expect, test } from '@jest/globals';

import { tokenBlacklistService } from '../../../../src/application/services/TokenBlacklistService';
import { TokenService } from '../../../../src/application/services/TokenService';
import { RefreshTokenUseCase } from '../../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { UnauthorizedError } from '../../../../src/shared/errors/AppError';
import { buildUser } from './support/user.fixture';
import { createMockUserRepository } from './support/userRepository.mock';

describe('RefreshTokenUseCase', () => {
  const tokenService = new TokenService();

  beforeEach(() => {
    tokenBlacklistService.clear();
  });

  test('returns token pair when refresh token is valid', async () => {
    const repository = createMockUserRepository();
    repository.findById.mockResolvedValue(
      buildUser({
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        email: 'refresh.use.case@example.com',
        role: 'admin',
      }),
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
    const repository = createMockUserRepository();

    const useCase = new RefreshTokenUseCase(tokenService, repository);

    await expect(useCase.execute('invalid.refresh.token')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  test('revokes used refresh token and rejects replay', async () => {
    const userId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    const email = 'single.use.refresh@example.com';
    const repository = createMockUserRepository();
    repository.findById.mockResolvedValue(
      buildUser({
        id: userId,
        email,
        role: 'user',
      }),
    );

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
