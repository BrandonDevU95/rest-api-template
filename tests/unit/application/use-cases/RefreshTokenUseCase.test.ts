import { RefreshTokenUseCase } from '../../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { TokenService } from '../../../../src/application/services/TokenService';
import { UnauthorizedError } from '../../../../src/shared/errors/AppError';

describe('RefreshTokenUseCase', () => {
  const tokenService = new TokenService();
  const useCase = new RefreshTokenUseCase(tokenService);

  test('returns token pair when refresh token is valid', () => {
    const original = tokenService.createTokenPair({
      sub: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      email: 'refresh.use.case@example.com',
      role: 'admin',
    });

    const refreshed = useCase.execute(original.refreshToken);

    const payload = tokenService.verifyAccessToken(refreshed.accessToken);
    expect(payload.sub).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    expect(payload.email).toBe('refresh.use.case@example.com');
    expect(payload.role).toBe('admin');
  });

  test('throws UnauthorizedError for invalid refresh token', () => {
    expect(() => useCase.execute('invalid.refresh.token')).toThrow(UnauthorizedError);
  });
});
