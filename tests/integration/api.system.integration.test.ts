import { beforeEach, describe, expect, test } from '@jest/globals';
import { app, resetIntegrationState } from './support/apiTestContext';

import request from 'supertest';

describe('API integration - system endpoints', () => {
  beforeEach(() => {
    resetIntegrationState();
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
    const response = await request(app).get('/api/v1/health').set('Origin', 'https://evil.example');

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });
});
