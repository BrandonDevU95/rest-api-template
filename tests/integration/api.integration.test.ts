import { AuthUser, User, UserRole } from '../../src/domain/entities/User';

import { HashService } from '../../src/application/services/HashService';
import { TokenService } from '../../src/application/services/TokenService';
import { tokenBlacklistService } from '../../src/application/services/TokenBlacklistService';
import request from 'supertest';

const mockUserRepository = {
  findByEmail: jest.fn(),
  findByEmailForAuth: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  list: jest.fn(),
  deleteById: jest.fn(),
};

jest.mock('../../src/infrastructure/database/repositories/UserRepository', () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app } = require('../../src/app');



const hashService = new HashService();
const tokenService = new TokenService();

const buildUser = (overrides?: Partial<{
  id: string;
  email: string;
  role: UserRole;
}>): User => {
  const now = new Date();
  return new User({
    id: overrides?.id ?? '11111111-1111-1111-1111-111111111111',
    email: overrides?.email ?? 'user@example.com',
    role: overrides?.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  });
};

const buildAuthUser = (overrides?: Partial<{ id: string; email: string; passwordHash: string; role: UserRole }>): AuthUser => {
  const now = new Date();
  return new AuthUser({
    id: overrides?.id ?? '11111111-1111-1111-1111-111111111111',
    email: overrides?.email ?? 'user@example.com',
    passwordHash: overrides?.passwordHash ?? '$2b$12$JSE3mkuN8RwdFfQf7rxk8e4QwPwFsEYh3YOEoTP0TO.GfYh3CX6Ka',
    role: overrides?.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  });
};
describe('API integration baseline', () => {
  beforeEach(() => {
    Object.values(mockUserRepository).forEach((fn) => fn.mockReset());
    tokenBlacklistService.clear();
  });

  test('GET /api/v1/health responds with service status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.uptime).toBeUndefined();
    expect(typeof response.body.timestamp).toBe('string');
  });

  test('unknown route returns normalized NOT_FOUND error contract', async () => {
    const response = await request(app).get('/api/v1/route-that-does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(typeof response.body.message).toBe('string');
    expect(typeof response.body.correlationId).toBe('string');
    expect(typeof response.body.timestamp).toBe('string');
  });

  test('GET /api/v1/health rejects disallowed CORS origins with FORBIDDEN', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://evil.example');

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/v1/auth/register creates a user and returns token pair', async () => {
    const email = 'new.user@example.com';
    const password = 'Password123!';

    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockUserRepository.create.mockResolvedValueOnce(
      buildUser({
        id: '22222222-2222-2222-2222-222222222222',
        email,
        role: 'user',
      }),
    );

    const response = await request(app).post('/api/v1/auth/register').send({
      email,
      password,
    });

    expect(response.status).toBe(201);
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
  });

  test('POST /api/v1/auth/register returns 409 when email already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(
      buildUser({ email: 'duplicate@example.com' }),
    );

    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'duplicate@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CONFLICT');
  });

  test('POST /api/v1/auth/register validates payload and returns 400', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'invalid-email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(response.body.details.errors)).toBe(true);
  });

  test('POST /api/v1/auth/register rejects numeric password type to prevent Joi coercion', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'typed-password@example.com',
      password: 12345678,
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/register rejects unexpected fields instead of silently stripping them', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'unknown-fields@example.com',
      password: 'Password123!',
      role: 'admin',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/register rejects weak low-entropy passwords', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'weak-password@example.com',
      password: 'aaaaaaaaaaaa',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/login returns tokens for valid credentials', async () => {
    const email = 'login@example.com';
    const password = 'Password123!';
    const passwordHash = await hashService.hash(password);

    mockUserRepository.findByEmailForAuth.mockResolvedValueOnce(
      buildAuthUser({
        id: '33333333-3333-3333-3333-333333333333',
        email,
        passwordHash,
        role: 'user',
      }),
    );

    const response = await request(app).post('/api/v1/auth/login').send({
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
  });

  test('POST /api/v1/auth/login rejects invalid credentials', async () => {
    const email = 'login@example.com';
    const passwordHash = await hashService.hash('AnotherPassword123!');

    mockUserRepository.findByEmailForAuth.mockResolvedValueOnce(
      buildAuthUser({
        id: '44444444-4444-4444-4444-444444444444',
        email,
        passwordHash,
      }),
    );

    const response = await request(app).post('/api/v1/auth/login').send({
      email,
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(401);
  });

  test('POST /api/v1/auth/refresh returns a new token pair for valid refresh token', async () => {
    const userId = '55555555-5555-5555-5555-555555555555';
    const tokens = tokenService.createTokenPair({
      sub: userId,
      email: 'refresh@example.com',
      role: 'user',
    });

    mockUserRepository.findById.mockResolvedValueOnce(
      buildUser({
        id: userId,
        email: 'refresh@example.com',
        role: 'user',
      }),
    );

    const response = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: tokens.refreshToken,
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
  });

  test('POST /api/v1/auth/refresh returns 401 for invalid refresh token', async () => {
    const response = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: 'invalid.refresh.token',
    });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  test('POST /api/v1/auth/refresh returns 400 for malformed refresh token format', async () => {
    const response = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: 'not-a-jwt',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/refresh rejects replay of an already used refresh token', async () => {
    const userId = '5f5f5f5f-5f5f-5f5f-5f5f-5f5f5f5f5f5f';
    const email = 'refresh-replay@example.com';
    const tokens = tokenService.createTokenPair({
      sub: userId,
      email,
      role: 'user',
    });

    mockUserRepository.findById.mockResolvedValue(
      buildUser({
        id: userId,
        email,
        role: 'user',
      }),
    );

    const firstResponse = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: tokens.refreshToken,
    });

    const secondResponse = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: tokens.refreshToken,
    });

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(401);
    expect(secondResponse.body.code).toBe('UNAUTHORIZED');
  });
  test('POST /api/v1/auth/logout returns 400 for malformed optional refresh token', async () => {
    const userId = '88888888-8888-8888-8888-888888888888';
    const accessToken = tokenService.signAccessToken({
      sub: userId,
      email: 'logout@example.com',
      role: 'user',
    });

    mockUserRepository.findById.mockResolvedValueOnce(
      buildUser({
        id: userId,
        email: 'logout@example.com',
        role: 'user',
      }),
    );

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken: 'not-a-jwt' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/logout rejects refresh token that belongs to a different user', async () => {
    const requesterId = '9a9a9a9a-9a9a-9a9a-9a9a-9a9a9a9a9a9a';
    const victimId = 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1';

    const requesterTokens = tokenService.createTokenPair({
      sub: requesterId,
      email: 'requester@example.com',
      role: 'user',
    });

    const victimTokens = tokenService.createTokenPair({
      sub: victimId,
      email: 'victim@example.com',
      role: 'user',
    });

    mockUserRepository.findById.mockResolvedValueOnce(
      buildUser({
        id: requesterId,
        email: 'requester@example.com',
        role: 'user',
      }),
    );

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${requesterTokens.accessToken}`)
      .send({ refreshToken: victimTokens.refreshToken });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  test('GET /api/v1/auth/profile requires authentication', async () => {
    const response = await request(app).get('/api/v1/auth/profile');

    expect(response.status).toBe(401);
  });

  test('GET /api/v1/auth/profile returns authenticated identity', async () => {
    const userId = '66666666-6666-6666-6666-666666666666';
    const email = 'profile@example.com';
    const accessToken = tokenService.signAccessToken({
      sub: userId,
      email,
      role: 'admin',
    });

    mockUserRepository.findById.mockResolvedValueOnce(
      buildUser({
        id: userId,
        email,
        role: 'admin',
      }),
    );

    const response = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.email).toBe(email);
    expect(response.body.role).toBe('admin');
  });

  test('GET /api/v1/auth/profile rejects unexpected query params', async () => {
    const userId = '99999999-9999-9999-9999-999999999999';
    const accessToken = tokenService.signAccessToken({
      sub: userId,
      email: 'query@example.com',
      role: 'user',
    });

    mockUserRepository.findById.mockResolvedValueOnce(
      buildUser({
        id: userId,
        email: 'query@example.com',
        role: 'user',
      }),
    );

    const response = await request(app)
      .get('/api/v1/auth/profile')
      .query({ debug: 'true' })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  test('GET /api/v1/users returns 403 for authenticated non-admin user', async () => {
    const userId = '77777777-7777-7777-7777-777777777777';
    const accessToken = tokenService.signAccessToken({
      sub: userId,
      email: 'regular@example.com',
      role: 'user',
    });

    mockUserRepository.findById.mockResolvedValueOnce(
      buildUser({
        id: userId,
        email: 'regular@example.com',
        role: 'user',
      }),
    );

    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });

  test('GET /api/v1/users rejects unexpected query params', async () => {
    const adminId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const accessToken = tokenService.signAccessToken({
      sub: adminId,
      email: 'admin-query@example.com',
      role: 'admin',
    });

    mockUserRepository.findById.mockResolvedValueOnce(
      buildUser({
        id: adminId,
        email: 'admin-query@example.com',
        role: 'admin',
      }),
    );

    const response = await request(app)
      .get('/api/v1/users')
      .query({ limit: '10' })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  test('GET /api/v1/users returns 200 and user list for admin', async () => {
    const adminId = '12121212-1212-1212-1212-121212121212';
    const accessToken = tokenService.signAccessToken({
      sub: adminId,
      email: 'admin@example.com',
      role: 'admin',
    });

    mockUserRepository.findById.mockResolvedValueOnce(
      buildUser({
        id: adminId,
        email: 'admin@example.com',
        role: 'admin',
      }),
    );

    mockUserRepository.list.mockResolvedValueOnce([
      buildUser({
        id: '13131313-1313-1313-1313-131313131313',
        email: 'listed.user@example.com',
        role: 'user',
      }),
    ]);

    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].email).toBe('listed.user@example.com');
    expect(response.body[0].role).toBe('user');
  });
});



