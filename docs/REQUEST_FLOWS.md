# Request Flows

This document describes the runtime request pipeline and endpoint-level behavior.

## Global Pipeline (from `src/app.ts`)

Order matters:

1. `requestContextMiddleware`
2. `httpLogger`
3. `securityHeaders`
4. `corsMiddleware`
5. `express.json({ limit: '1mb' })`
6. `passport.initialize()`
7. `apiRateLimiter`
8. mount `apiRouter` on `env.app.apiPrefix`
9. `notFoundHandler`
10. `errorHandler`

## Auth Routes (`/auth`)

### POST `/register`
- Middlewares:
  1. `validate({ body: registerSchema })`
- Handler: `AuthController.register`
- Expected result: token pair for created user.
- Key errors:
  - 400 validation error
  - 409 email already exists

### POST `/login`
- Middlewares:
  1. `loginRateLimiter`
  2. `validate({ body: loginSchema })`
  3. `passport.authenticate('local', { session: false })`
- Handler: `AuthController.login`
- Expected result: token pair.
- Key errors:
  - 400 validation error
  - 401 invalid credentials
  - 429 too many attempts

### POST `/refresh`
- Middlewares:
  1. `validate({ body: refreshTokenSchema })`
- Handler: `AuthController.refresh`
- Expected result: new token pair.
- Key errors:
  - 400 validation error
  - 401 invalid or expired refresh token

### GET `/profile`
- Middlewares:
  1. `authenticateJwt`
- Handler: `AuthController.profile`
- Expected result: current user identity payload.
- Key errors:
  - 401 missing/invalid token

## User Routes (`/users`)

### POST `/`
- Middlewares:
  1. `authenticateJwt`
  2. `authorizeRoles('admin')`
  3. `validate({ body: createUserSchema })`
- Handler: `UserController.create`
- Expected result: created user projection.
- Key errors:
  - 401 unauthenticated
  - 403 not admin
  - 409 email conflict

### GET `/`
- Middlewares:
  1. `authenticateJwt`
  2. `authorizeRoles('admin')`
- Handler: `UserController.list`
- Expected result: array of user projections.

### GET `/:id`
- Middlewares:
  1. `authenticateJwt`
  2. `validate({ params: idParamSchema })`
  3. `authorizeAdminOrSelf`
- Handler: `UserController.getById`
- Expected result: single user projection.
- Key errors:
  - 404 user not found

### PUT `/:id`
- Middlewares:
  1. `authenticateJwt`
  2. `validate({ params: idParamSchema, body: updateUserSchema })`
  3. `authorizeAdminOrSelf`
- Handler: `UserController.update`
- Expected result: updated user projection.
- Key errors:
  - 404 user not found
  - 409 email conflict

### DELETE `/:id`
- Middlewares:
  1. `authenticateJwt`
  2. `authorizeRoles('admin')`
  3. `validate({ params: idParamSchema })`
- Handler: `UserController.delete`
- Expected result: `204 No Content`.

## Health Route (`/health`)

### GET `/health`
- Middlewares: none (public endpoint)
- Handler: health route handler
- Expected result: service status payload.

## Error Contract

Any unhandled error reaches `errorHandler` and returns a normalized shape:

- `code`
- `message`
- `details`
- `correlationId`
- `timestamp`

`correlationId` should be used to trace requests across HTTP and application logs.
