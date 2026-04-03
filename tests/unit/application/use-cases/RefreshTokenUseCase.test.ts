import { RefreshTokenUseCase } from '../../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { TokenService } from '../../../../src/application/services/TokenService';
import { UnauthorizedError } from '../../../../src/shared/errors/AppError';
import { User } from '../../../../src/domain/entities/User';

const buildUser = (id: string, email: string, role: 'admin' | 'user'): User => {
  const now = new Date();
  return new User({
    id,
    email,
    passwordHash: '$2b$12$JSE3mkuN8RwdFfQf7rxk8e4QwPwFsEYh3YOEoTP0TO.GfYh3CX6Ka',
    role,
    createdAt: now,
    updatedAt: now,
  });
};

describe('RefreshTokenUseCase', () => {
  const tokenService = new TokenService();

  test('returns token pair when refresh token is valid', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(
        buildUser('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'refresh.use.case@example.com', 'admin'),
      ),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      list: jest.fn(),
      deleteById: jest.fn(),
    };

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
    const repository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      list: jest.fn(),
      deleteById: jest.fn(),
    };

    const useCase = new RefreshTokenUseCase(tokenService, repository);

    await expect(useCase.execute('invalid.refresh.token')).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
