import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  app,
  buildUser,
  mockUserRepository,
  resetIntegrationState,
  tokenService,
} from './support/apiTestContext';

import request from 'supertest';

describe('API integration - users endpoints', () => {
  beforeEach(() => {
    resetIntegrationState();
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
