# Flujos De Solicitud

Este documento describe el pipeline de requests en runtime y el comportamiento a nivel endpoint.

## Pipeline Global (desde `src/app.ts`)

El orden importa:

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

## Rutas Auth (`/auth`)

### POST `/register`
- Middlewares:
  1. `registerRateLimiter`
  2. `validate({ body: registerSchema })`
- Handler: `AuthController.register`
- Resultado esperado: respuesta aceptada uniforme sin revelar si el correo existia.
- Errores clave:
  - 400 error de validacion
  - 429 demasiados intentos de registro
  - no revela si el email ya existia

### POST `/login`
- Middlewares:
  1. `loginRateLimiter`
  2. `validate({ body: loginSchema })`
  3. `passport.authenticate('local', { session: false })`
- Handler: `AuthController.login`
- Resultado esperado: par de tokens.
- Errores clave:
  - 400 error de validacion
  - 401 credenciales invalidas
  - 429 demasiados intentos

### POST `/refresh`
- Middlewares:
  1. `validate({ body: refreshTokenSchema })`
- Handler: `AuthController.refresh`
- Resultado esperado: nuevo par de tokens.
- Errores clave:
  - 400 error de validacion
  - 401 refresh token invalido o expirado

### GET `/profile`
- Middlewares:
  1. `authenticateJwt`
- Handler: `AuthController.profile`
- Resultado esperado: payload de identidad del usuario actual.
- Errores clave:
  - 401 token faltante/invalido

## Rutas De Usuario (`/users`)

### POST `/`
- Middlewares:
  1. `authenticateJwt`
  2. `authorizeRoles('admin')`
  3. `validate({ body: createUserSchema })`
- Handler: `UserController.create`
- Resultado esperado: proyeccion de usuario creado.
- Errores clave:
  - 401 no autenticado
  - 403 no es admin
  - 409 conflicto de email

### GET `/`
- Middlewares:
  1. `authenticateJwt`
  2. `authorizeRoles('admin')`
- Handler: `UserController.list`
- Resultado esperado: arreglo de proyecciones de usuario.

### GET `/:id`
- Middlewares:
  1. `authenticateJwt`
  2. `validate({ params: idParamSchema })`
  3. `authorizeAdminOrSelf`
- Handler: `UserController.getById`
- Resultado esperado: proyeccion de un solo usuario.
- Errores clave:
  - 404 usuario no encontrado

### PUT `/:id`
- Middlewares:
  1. `authenticateJwt`
  2. `validate({ params: idParamSchema, body: updateUserSchema })`
  3. `authorizeAdminOrSelf`
- Handler: `UserController.update`
- Resultado esperado: proyeccion de usuario actualizada.
- Errores clave:
  - 404 usuario no encontrado
  - 409 conflicto de email

### DELETE `/:id`
- Middlewares:
  1. `authenticateJwt`
  2. `authorizeRoles('admin')`
  3. `validate({ params: idParamSchema })`
- Handler: `UserController.delete`
- Resultado esperado: `204 No Content`.

## Ruta Health (`/health`)

### GET `/health`
- Middlewares: ninguno (endpoint publico)
- Handler: health route handler
- Resultado esperado: payload de estado del servicio.

## Contrato De Error

Cualquier error no manejado llega a `errorHandler` y retorna una estructura normalizada:

- `code`
- `message`
- `details`
- `correlationId`
- `timestamp`

`correlationId` debe usarse para trazar requests entre logs HTTP y logs de aplicacion.
