# Troubleshooting

Common setup and runtime issues for this project.

## 1) `getaddrinfo ENOTFOUND mysql`

### Symptom
Database commands fail from host shell with an error resolving `mysql`.

### Cause
`.env` uses `DB_HOST=mysql`, which is only resolvable inside the Docker network.

### Fix
Run database commands inside the API container:

- `docker compose exec api npm run db:migrate`
- `docker compose exec api npm run db:seed`

If running outside Docker, set `DB_HOST=localhost` and ensure local MySQL is running.

## 2) `docker compose up --build` fails

### Symptom
Compose exits with code 1 during build or startup.

### Checklist
1. Confirm Docker engine is running.
2. Confirm `.env` exists and all required variables are set.
3. Check if required ports are free (`3000`, `3306`, `8081` by default).
4. Re-run with logs: `docker compose up --build` and inspect the first failing service.
5. If image cache is stale, rebuild without cache: `docker compose build --no-cache` then `docker compose up`.

## 3) API starts but migrations fail

### Symptom
API container is up, but migration command fails.

### Cause
Database is not healthy yet, wrong credentials, or wrong host.

### Fix
1. Verify database container health in `docker compose ps`.
2. Verify DB env values in `.env`.
3. Run migration from container shell:
   - `docker compose exec api npm run db:migrate`

## 4) Login always returns 401

### Symptom
`POST /auth/login` returns unauthorized even with expected credentials.

### Causes
- User does not exist.
- Password hash mismatch.
- Seeder not executed.

### Fix
1. Run seed command again if needed.
2. Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.
3. Check DB row in `users` table.

## 5) Requests blocked by CORS

### Symptom
Browser requests fail with CORS error.

### Cause
Origin is not allowed by `CORS_ORIGIN` configuration.

### Fix
Add your frontend origin to `CORS_ORIGIN` in `.env` and restart API.

## 6) Too many requests (429)

### Symptom
Responses return 429 for repeated calls.

### Cause
Rate limit settings are active globally and on login route.

### Fix
Adjust rate limit env vars for your environment:
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_LOGIN_MAX_REQUESTS`

## 7) Swagger not available

### Symptom
`/api-docs` returns 404.

### Causes
- Wrong API prefix in env.
- Swagger setup not mounted due to startup failure.

### Fix
1. Confirm API is running without boot errors.
2. Confirm expected URL combines prefix and docs route.
3. Check app startup logs for swagger initialization errors.

## 8) Logs missing correlation id

### Symptom
Hard to trace one request across logs.

### Cause
Client did not send `x-correlation-id`, or middleware order changed.

### Fix
1. Keep `requestContextMiddleware` before request logging middleware.
2. Optionally send `x-correlation-id` from clients.
