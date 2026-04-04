# Flujos De Solicitud

Este documento describe el pipeline request-response en runtime y el comportamiento por endpoint.

## Pipeline Global (desde `src/app.ts`)

El orden de middlewares es intencional:

1. `requestContext`
2. `httpLogger`
3. `helmetMiddleware`
4. `corsMiddleware`
5. `express.json({ limit: '1mb' })`
6. `express.urlencoded({ extended: true })`
7. `passport.initialize()`
8. `apiRateLimiter`
9. montaje de `apiRouter` en `env.app.apiPrefix`
10. `notFoundHandler`
11. `errorHandler`

Notas:

- Todas las rutas privadas dependen de Passport JWT (`authenticateJwt`).
- En `production`, `/api-docs` y `/documentation` solo se exponen si `ENABLE_PUBLIC_DOCS=true`.

## Contrato De Error Comun

Todo error termina en `errorHandler` con el contrato:

- `code`
- `message`
- `details`
- `correlationId`
- `timestamp`

`correlationId` debe usarse para trazar cada request en logs HTTP y logs de aplicacion.

## Rutas Auth (`/auth`)

Todas las rutas de auth rechazan query params no esperados mediante `validate({ query: noQuerySchema })`.

### POST `/register`

- Middlewares:
  1. `registerRateLimiter`
  2. `validate({ body: registerSchema, query: noQuerySchema })`
- Handler: `AuthController.register`
- Exito: `201` con proyeccion publica del usuario creado.
- Errores clave:
  - `400` (`VALIDATION_ERROR`)
  - `409` (`CONFLICT`) cuando el email ya existe
  - `429` (`TOO_MANY_REGISTRATION_ATTEMPTS`)

### POST `/login`

- Middlewares:
  1. `loginRateLimiter`
  2. `validate({ body: loginSchema, query: noQuerySchema })`
  3. `passport.authenticate('local', { session: false })`
- Handler: `AuthController.login`
- Exito: `200` con `accessToken` + `refreshToken`.
- Errores clave:
  - `400` (`VALIDATION_ERROR`)
  - `401` (`UNAUTHORIZED`) por credenciales invalidas
  - `429` (`TOO_MANY_LOGIN_ATTEMPTS`)

### POST `/refresh`

- Middlewares:
  1. `loginRateLimiter`
  2. `validate({ body: refreshSchema, query: noQuerySchema })`
- Handler: `AuthController.refresh`
- Exito: `200` con nuevo par de tokens.
- Seguridad:
  - verifica `issuer`, `audience`, `algorithm`, `tokenType='refresh'` y `jti`
  - rechaza refresh revocado
  - rota refresh token revocando el `jti` usado (replay protection)
- Errores clave:
  - `400` (`VALIDATION_ERROR`)
  - `401` (`UNAUTHORIZED`) token invalido/revocado/expirado
  - `429` (`TOO_MANY_LOGIN_ATTEMPTS`)

### POST `/logout`

- Middlewares:
  1. `authenticateJwt`
  2. `validate({ body: logoutSchema, query: noQuerySchema })`
- Handler: `AuthController.logout`
- Exito: `204 No Content`.
- Seguridad:
  - revoca `jti` del access token actual
  - si llega refresh token, valida que pertenezca al mismo `sub` del access token
  - revoca refresh token valido del mismo usuario
- Errores clave:
  - `400` (`VALIDATION_ERROR`)
  - `401` (`UNAUTHORIZED`) token invalido o refresh de otro usuario

### GET `/profile`

- Middlewares:
  1. `authenticateJwt`
  2. `validate({ query: noQuerySchema })`
- Handler: `AuthController.profile`
- Exito: `200` con identidad del usuario autenticado.
- Errores clave:
  - `401` (`UNAUTHORIZED`)

## Rutas Users (`/users`)

`usersRouter` aplica `authenticateJwt` a todo el grupo y ademas valida query vacia.

### POST `/users`

- Middlewares:
  1. `authorizeRoles('admin')`
  2. `validate({ body: createUserSchema, query: noQuerySchema })`
- Handler: `UserController.create`
- Exito: `201` con usuario creado.
- Errores clave:
  - `401` no autenticado
  - `403` rol insuficiente
  - `409` email duplicado

### GET `/users`

- Middlewares:
  1. `authorizeRoles('admin')`
  2. `validate({ query: noQuerySchema })`
- Handler: `UserController.list`
- Exito: `200` con listado de usuarios.

### GET `/users/:id`

- Middlewares:
  1. `validate({ params: idParamSchema, query: noQuerySchema })`
  2. `authorizeAdminOrSelf`
- Handler: `UserController.getById`
- Exito: `200` con usuario.
- Errores clave:
  - `403` sin permisos
  - `404` usuario no encontrado

### PUT `/users/:id`

- Middlewares:
  1. `validate({ params: idParamSchema, body: updateUserSchema, query: noQuerySchema })`
  2. `authorizeAdminOrSelf`
- Handler: `UserController.update`
- Exito: `200` con usuario actualizado.
- Errores clave:
  - `400` validacion
  - `403` sin permisos
  - `404` no encontrado
  - `409` email duplicado

### DELETE `/users/:id`

- Middlewares:
  1. `validate({ params: idParamSchema, query: noQuerySchema })`
  2. `authorizeRoles('admin')`
- Handler: `UserController.delete`
- Exito: `204 No Content`.
- Errores clave:
  - `403` rol insuficiente
  - `404` no encontrado

## Ruta Health

### GET `/health`

- Middlewares: ninguno (publica).
- Handler: `healthRouter`.
- Exito: `200` con `status` y `timestamp`.
