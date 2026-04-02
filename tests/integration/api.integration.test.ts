import request from 'supertest';
import { HashService } from '../../src/application/services/HashService';
import { TokenService } from '../../src/application/services/TokenService';
import { User, UserRole } from '../../src/domain/entities/User';

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  list: jest.fn(),
  deleteById: jest.fn(),
};

jest.mock('../../src/infrastructure/database/repositories/UserRepository', () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

import { app } from '../../src/app';

const hashService = new HashService();
const tokenService = new TokenService();

const buildUser = (overrides?: Partial<{
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}>): User => {
  const now = new Date();
  return new User({
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
  });

  test('GET /api/v1/health responds with service status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.uptime).toBe('number');
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

  test('POST /api/v1/auth/register creates a user and returns token pair', async () => {
    const email = 'new.user@example.com';
    const password = 'Password123!';

    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    const passwordHash = await hashService.hash(password);
    mockUserRepository.create.mockResolvedValueOnce(
      buildUser({
        id: '22222222-2222-2222-2222-222222222222',
        email,
        passwordHash,
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

  test('POST /api/v1/auth/login returns tokens for valid credentials', async () => {
    const email = 'login@example.com';
    const password = 'Password123!';
    const passwordHash = await hashService.hash(password);

    mockUserRepository.findByEmail.mockResolvedValueOnce(
      buildUser({
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

    mockUserRepository.findByEmail.mockResolvedValueOnce(
      buildUser({
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
    const tokens = tokenService.createTokenPair({
      sub: '55555555-5555-5555-5555-555555555555',
      email: 'refresh@example.com',
      role: 'user',
    });

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
});
