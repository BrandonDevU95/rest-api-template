# Referencia De Archivos

Este documento describe el proposito de los archivos y carpetas principales del repositorio, y que debe revisarse en documentacion cuando se modifican.

## Archivos De Raiz

### `docker-compose.yml`

- Proposito: orquestar servicios locales (`api`, `mysql`, `phpmyadmin`).
- Documentar al cambiar: puertos, healthchecks, volumenes, dependencias y politica de red.
- Riesgos: orden de arranque incorrecto, exposicion de puertos no deseada, perdida de persistencia.

### `Dockerfile`

- Proposito: build de imagen y runtime de la API.
- Documentar al cambiar: etapas, usuario final, assets copiados, comando de arranque y hardening.
- Riesgos: imagen insegura, dependencias faltantes en produccion.

### `package.json`

- Proposito: scripts, dependencias y metadatos.
- Documentar al cambiar: contrato de scripts (`dev`, `build`, `start`, `db:*`, `test:*`, `naming:sync`) y librerias criticas.
- Riesgos: flujo local/CI roto.

### `sequelize.config.js`

- Proposito: configuracion de sequelize-cli para migraciones y seeders.
- Documentar al cambiar: mapeo de entornos y origen de credenciales.
- Riesgos: ejecutar migraciones en entorno equivocado.

### `jest.config.js`

- Proposito: configuracion global de pruebas.
- Documentar al cambiar: roots, patrones, transform y cobertura.
- Riesgos: pruebas no detectadas o cobertura inconsistente.

### `nodemon.json`

- Proposito: configuracion de recarga automatica en desarrollo local.
- Documentar al cambiar: rutas observadas/ignoradas y comando de ejecucion.
- Riesgos: recargas excesivas o flujo de desarrollo inestable.

### `tsconfig.json` / `tsconfig.test.json`

- Proposito: configuracion TypeScript para app y test.
- Documentar al cambiar: target/module, strictness, includes/excludes.
- Riesgos: incompatibilidad de compilacion o errores de tipos.

### `README.md`

- Proposito: onboarding rapido, variables y mapa documental.
- Documentar al cambiar: pasos de arranque, seguridad de runtime y enlaces a docs.
- Riesgos: onboarding desalineado con el estado real.

### `CHANGELOG.md`

- Proposito: historial de versiones y cambios.
- Documentar al cambiar: releases y features relevantes.
- Riesgos: perdida de trazabilidad entre version y comportamiento.

### `LICENSE`

- Proposito: terminos legales de uso y distribucion.
- Documentar al cambiar: tipo de licencia e implicaciones para proyectos derivados.
- Riesgos: ambiguedad legal o incumplimientos de distribucion.

### `scripts/sync-project-metadata.js`

- Proposito: sincronizar nombre y descripcion del paquete desde `PROJECT_SLUG`.
- Documentar al cambiar: reglas de transformacion del slug y archivos afectados.
- Riesgos: desalineacion entre entorno y metadatos.

## Carpeta `docs/`

### `docs/ARCHITECTURE.md`

- Proposito: reglas por capa y direccion de dependencias.
- Documentar al cambiar: responsabilidades por capa, seguridad y observabilidad.

### `docs/INSTALLATION.md`

- Proposito: instalacion detallada y comandos operativos.
- Documentar al cambiar: flujo Docker/local y comandos DB.

### `docs/REQUEST_FLOWS.md`

- Proposito: pipeline HTTP y comportamiento endpoint por endpoint.
- Documentar al cambiar: orden de middlewares, validacion, auth y respuestas.

### `docs/LOGGER.md`

- Proposito: politica de logging, redaccion y correlation id.
- Documentar al cambiar: formatos, claves sensibles y puntos de instrumentacion.

### `docs/TROUBLESHOOTING.md`

- Proposito: fallos comunes y soluciones comprobadas.
- Documentar al cambiar: incidencias nuevas de setup, auth, docs o seguridad.

### `docs/PROJECT_CUSTOMIZATION.md`

- Proposito: renombre y personalizacion de proyecto.
- Documentar al cambiar: variables y pasos de naming.

### `docs/FILES_REFERENCE.md`

- Proposito: mapa de responsabilidades archivo por archivo y checklist documental.
- Documentar al cambiar: nuevas rutas, cambios de responsabilidad y criterios de terminado.

### `docs/viewer/*`

- Proposito: visor HTML de documentacion (`/documentation`) y personalizacion visual de Swagger.
- Documentar al cambiar: rutas estaticas, archivos cargados, comportamiento de busqueda.

## Carpeta `src/`

### Puntos De Entrada

#### `src/main.ts`

- Proposito: bootstrap (DB, servidor HTTP, shutdown y job de mantenimiento).
- Documentar al cambiar: secuencia de arranque/parada y manejo de errores fatales.

#### `src/app.ts`

- Proposito: composicion de middlewares, docs publicas y routers.
- Documentar al cambiar: orden del pipeline, reglas de exposicion de docs y puntos de montaje.

### Capa Application

#### `src/application/dto/auth.dto.ts`

- Proposito: DTOs de auth y payload JWT.
- Documentar al cambiar: campos y contratos de tokens.

#### `src/application/services/HashService.ts`

- Proposito: hash y comparacion de contrasenas.
- Documentar al cambiar: algoritmo y politica de costo.

#### `src/application/services/TokenService.ts`

- Proposito: firmado y verificacion JWT (`HS256`) con `issuer`, `audience`, `tokenType` y `jti`.
- Documentar al cambiar: claims obligatorios, expiraciones y reglas de verificacion.

#### `src/application/services/TokenBlacklistService.ts`

- Proposito: contrato de revocacion de tokens (persistente en DB, en memoria en tests).
- Documentar al cambiar: semantica de blacklist, limpieza y comportamiento por entorno.

#### `src/application/use-cases/auth/RegisterUseCase.ts`

- Proposito: registro de usuario con validacion de duplicado y hash.
- Documentar al cambiar: comportamiento de conflicto (409) y metadatos logueados.

#### `src/application/use-cases/auth/RefreshTokenUseCase.ts`

- Proposito: rotacion de refresh token con replay protection (revoca el refresh usado).
- Documentar al cambiar: pasos de verificacion y errores de seguridad.

#### `src/application/use-cases/auth/LogoutUseCase.ts`

- Proposito: logout revocando `jti` de access token y opcionalmente refresh token.
- Documentar al cambiar: validacion de pertenencia de refresh al mismo usuario y semantica de errores.

### Capa Config

#### `src/config/environment.ts`

- Proposito: validacion Joi de entorno y configuracion tipada.
- Documentar al cambiar: variables requeridas, defaults y validaciones de hardening.

#### `src/config/swagger.ts`

- Proposito: configuracion OpenAPI/Swagger.
- Documentar al cambiar: metadata, tags, escaneo de rutas y exposicion.

### Capa Domain

#### `src/domain/entities/User.ts`

- Proposito: entidad de negocio de usuario.
- Documentar al cambiar: invariantes, campos expuestos y reglas de rol.

#### `src/domain/interfaces/IUserRepository.ts`

- Proposito: contrato de persistencia de usuarios.
- Documentar al cambiar: metodos, retornos nulos y errores esperados.

### Capa Infrastructure

#### `src/infrastructure/auth/passport.ts`

- Proposito: estrategias Passport Local + JWT con verificacion de `tokenType`, `jti` revocado y consistencia de email.
- Documentar al cambiar: reglas de autenticacion y rechazo.

#### `src/infrastructure/database/sequelize.ts`

- Proposito: conexion Sequelize y opciones de pool/logging.
- Documentar al cambiar: configuracion de conexion y errores de arranque.

#### `src/infrastructure/database/models/UserModel.ts`

- Proposito: modelo ORM de usuarios.
- Documentar al cambiar: columnas, restricciones y scopes.

#### `src/infrastructure/database/models/RevokedTokenModel.ts`

- Proposito: modelo ORM de JTIs revocados (`revoked_tokens`).
- Documentar al cambiar: PK, enum de tipo y campos de expiracion.

#### `src/infrastructure/database/repositories/UserRepository.ts`

- Proposito: implementacion concreta de repositorio de usuarios.
- Documentar al cambiar: normalizacion de email y mapeo dominio/ORM.

#### `src/infrastructure/database/repositories/RevokedTokenRepository.ts`

- Proposito: persistencia de revocaciones y limpieza de tokens expirados.
- Documentar al cambiar: estrategia de `upsert`, consulta y limpieza.

#### `src/infrastructure/database/migrations/202604010001-create-users-table.js`

- Proposito: creacion de tabla `users`.
- Documentar al cambiar: estructura, indices y rollback.

#### `src/infrastructure/database/migrations/202604030001-create-revoked-tokens-table.js`

- Proposito: creacion de tabla `revoked_tokens` e indice por expiracion.
- Documentar al cambiar: columnas y estrategia `down`.

#### `src/infrastructure/database/seeders/202604010001-seed-admin-user.js`

- Proposito: siembra de usuario admin inicial.
- Documentar al cambiar: variables requeridas y password policy.

#### `src/infrastructure/logger/levels.ts`

- Proposito: niveles de severidad de Winston.
- Documentar al cambiar: jerarquia de niveles.

#### `src/infrastructure/logger/formats.ts`

- Proposito: formatos JSON/consola y redaccion de datos sensibles (claves + patrones JWT/Bearer).
- Documentar al cambiar: claves redactadas y reglas de sanitizacion.

#### `src/infrastructure/logger/logger.ts`

- Proposito: instancia Winston y transports.
- Documentar al cambiar: destinos, retencion y manejo de excepciones.

#### `src/infrastructure/logger/morgan.middleware.ts`

- Proposito: logs HTTP con correlation id.
- Documentar al cambiar: tokens y estructura del mensaje.

#### `src/infrastructure/logger/requestContext.middleware.ts`

- Proposito: generar/sanitizar `x-correlation-id` y propagarlo en request/response.
- Documentar al cambiar: reglas de sanitizacion y contrato de header.

#### `src/infrastructure/maintenance/tokenBlacklistCleanup.job.ts`

- Proposito: job periodico que limpia tokens revocados expirados.
- Documentar al cambiar: intervalo, estrategia de ejecucion y logs.

### Capa Presentation

#### `src/presentation/controllers/AuthController.ts`

- Proposito: endpoints auth (`register`, `login`, `refresh`, `logout`, `profile`).
- Documentar al cambiar: status codes y contratos de salida.

#### `src/presentation/controllers/UserController.ts`

- Proposito: CRUD de usuarios.
- Documentar al cambiar: permisos, proyecciones y errores de conflicto/no encontrado.

#### `src/presentation/middlewares/auth.middleware.ts`

- Proposito: auth JWT y autorizacion por rol.
- Documentar al cambiar: reglas de `authenticateJwt`, `authorizeRoles` y `authorizeAdminOrSelf`.

#### `src/presentation/middlewares/currentUser.middleware.ts`

- Proposito: lectura segura de usuario autenticado.
- Documentar al cambiar: precondiciones y errores.

#### `src/presentation/middlewares/errorHandler.ts`

- Proposito: normalizar errores y responder contrato publico con correlation id.
- Documentar al cambiar: payload de error y exposicion de detalles segun entorno.

#### `src/presentation/middlewares/security.middleware.ts`

- Proposito: Helmet, CORS, rate limit global y rate limit dedicado para login/registro/refresh.
- Documentar al cambiar: mensajes 429, limites y origen de configuracion.

#### `src/presentation/middlewares/validate.middleware.ts`

- Proposito: validacion Joi estricta (`convert:false`, `stripUnknown:false`).
- Documentar al cambiar: reglas de rechazo de campos y coercion.

#### `src/presentation/routes/auth.routes.ts`

- Proposito: cadena de middlewares y handlers de auth.
- Documentar al cambiar: inclusion de `logout`, query estricta vacia y rate limit de refresh.

#### `src/presentation/routes/users.routes.ts`

- Proposito: rutas CRUD de usuarios con JWT y RBAC.
- Documentar al cambiar: combinacion de validaciones de body/params/query y orden de middlewares.

#### `src/presentation/routes/health.routes.ts`

- Proposito: health check publico.
- Documentar al cambiar: payload de estado.

#### `src/presentation/routes/index.ts`

- Proposito: composicion del router API.
- Documentar al cambiar: subrutas montadas.

#### `src/presentation/validators/auth.validators.ts`

- Proposito: schemas Joi para `register/login/refresh/logout`.
- Documentar al cambiar: reglas de password, formato JWT y TLDs.

#### `src/presentation/validators/user.validators.ts`

- Proposito: schemas Joi para creacion/actualizacion/listado de usuarios.
- Documentar al cambiar: restricciones por campo y defaults.

### Shared

#### `src/shared/errors/AppError.ts`

- Proposito: jerarquia de errores de aplicacion y codigos publicos.
- Documentar al cambiar: codigos, status y `details`.

#### `src/shared/types/express.d.ts`

- Proposito: tipos extendidos para `req.user` y `req.correlationId`.
- Documentar al cambiar: forma de los tipos compartidos.

#### `src/shared/utils/asyncHandler.ts`

- Proposito: capturar promesas rechazadas en handlers async.
- Documentar al cambiar: contrato de propagacion a `next`.

## Carpeta `tests/`

### `tests/integration/*`

- Proposito: contratos HTTP end-to-end de auth, usuarios y sistema.
- Documentar al cambiar: cobertura de endpoints y escenarios de seguridad.

### `tests/integration/support/apiTestContext.ts`

- Proposito: helpers y wiring para pruebas de integracion.
- Documentar al cambiar: setup reutilizable de request/repositorio.

### `tests/unit/application/*`

- Proposito: pruebas de servicios y casos de uso de capa Application.
- Documentar al cambiar: casos felices, errores de seguridad y mocks.

### `tests/unit/infrastructure/*`

- Proposito: pruebas de repositorios, logger y jobs de mantenimiento.
- Documentar al cambiar: sanitizacion de logs, persistencia y cleanup.

### `tests/unit/**/support/*`

- Proposito: fixtures y mocks compartidos de pruebas.
- Documentar al cambiar: contratos de fixtures y consistencia de datos.

### `tests/jest-globals.d.ts`

- Proposito: tipos globales de Jest para el proyecto.
- Documentar al cambiar: alcance de tipado para suites.

## Definicion De Terminado Para Cambios De Documentacion

Cuando cambies archivos de este repositorio, la documentacion queda terminada solo si:

1. El proposito del archivo/carpeta sigue siendo correcto.
2. Se reflejan entradas, salidas y errores relevantes.
3. Se actualizan implicaciones de seguridad y observabilidad cuando apliquen.
4. Los cambios de rutas/middlewares se reflejan en `docs/REQUEST_FLOWS.md`.
5. Los enlaces entre documentos siguen vigentes.
