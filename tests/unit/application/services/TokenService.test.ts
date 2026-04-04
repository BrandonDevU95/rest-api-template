import jwt from 'jsonwebtoken';
import { env } from '../../../../src/config/environment';
import { TokenService } from '../../../../src/application/services/TokenService';

describe('TokenService', () => {
  const service = new TokenService();

  test('createTokenPair creates verifiable access and refresh tokens', () => {
    const payload = {
      sub: '88888888-8888-8888-8888-888888888888',
      email: 'token@example.com',
      role: 'user' as const,
    };

    const pair = service.createTokenPair(payload);

    expect(typeof pair.accessToken).toBe('string');
    expect(typeof pair.refreshToken).toBe('string');

    const accessPayload = service.verifyAccessToken(pair.accessToken);
    const refreshPayload = service.verifyRefreshToken(pair.refreshToken);

    expect(accessPayload.sub).toBe(payload.sub);
    expect(accessPayload.email).toBe(payload.email);
    expect(accessPayload.role).toBe(payload.role);

    expect(refreshPayload.sub).toBe(payload.sub);
    expect(refreshPayload.email).toBe(payload.email);
    expect(refreshPayload.role).toBe(payload.role);
  });

  test('verifyAccessToken rejects tokens with an unexpected issuer or audience', () => {
    const forgedToken = jwt.sign(
      {
        sub: '88888888-8888-8888-8888-888888888888',
        email: 'token@example.com',
        role: 'user' as const,
      },
      env.jwt.accessSecret,
      {
        expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
        algorithm: 'HS256',
        issuer: 'forged-issuer',
        audience: 'forged-audience',
      },
    );

    expect(() => service.verifyAccessToken(forgedToken)).toThrow();
  });

  test('verifyRefreshToken throws for malformed token', () => {
    expect(() => service.verifyRefreshToken('not-a-valid-token')).toThrow();
  });
});
