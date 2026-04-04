import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  app,
  buildAuthUser,
  buildUser,
  hashService,
  mockUserRepository,
  resetIntegrationState,
  tokenService,
} from './support/apiTestContext';

import request from 'supertest';

describe('API integration - auth endpoints', () => {
  beforeEach(() => {
    resetIntegrationState();
  });

  test('POST /api/v1/auth/register creates a user and returns 201', async () => {
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
    expect(response.body.id).toBe('22222222-2222-2222-2222-222222222222');
    expect(response.body.email).toBe(email);
    expect(response.body.role).toBe('user');
    expect(response.body.createdAt).toBeDefined();
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
    expect(response.body.message).toBe('Email already exists');
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

  test('POST /api/v1/auth/register returns 429 after too many attempts', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(
      buildUser({
        id: '33333333-3333-3333-3333-333333333333',
        email: 'rate.limit@example.com',
        role: 'user',
      }),
    );

    let lastResponse: any;
    for (let attempt = 0; attempt < 9; attempt += 1) {
      lastResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `rate.limit.${attempt}@example.com`,
          password: 'Password123!',
        });
    }

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.body.code).toBe('TOO_MANY_REGISTRATION_ATTEMPTS');
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

  test('POST /api/v1/auth/refresh rotates token: old token is rejected and new token remains valid', async () => {
    const userId = '7c7c7c7c-7c7c-7c7c-7c7c-7c7c7c7c7c7c';
    const email = 'refresh-rotation@example.com';
    const initialTokens = tokenService.createTokenPair({
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

    const firstRefresh = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: initialTokens.refreshToken,
    });

    const replayAttempt = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: initialTokens.refreshToken,
    });

    const secondRefresh = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: firstRefresh.body.refreshToken,
    });

    expect(firstRefresh.status).toBe(200);
    expect(typeof firstRefresh.body.refreshToken).toBe('string');
    expect(replayAttempt.status).toBe(401);
    expect(secondRefresh.status).toBe(200);
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
  });

  test('GET /api/v1/auth/profile rejects refresh token used as bearer token', async () => {
    const userId = 'dededede-dede-dede-dede-dededededede';
    const pair = tokenService.createTokenPair({
      sub: userId,
      email: 'refresh-bearer@example.com',
      role: 'user',
    });

    const response = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', 'Bearer ' + pair.refreshToken);

    expect(response.status).toBe(401);
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
});
