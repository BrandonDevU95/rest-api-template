# Referencia De Archivos

Este documento explica el proposito de cada archivo del repositorio y que debe documentarse cuando se modifica.

## Archivos De Raiz

### `docker-compose.yml`
- Proposito: Orquesta servicios locales (api, mysql, phpmyadmin).
- Documentar al cambiar: servicios, puertos, volumenes, healthchecks, dependencias.
- Personalizacion: deriva nombres de proyecto, contenedores y red desde `.env` usando `PROJECT_SLUG`.
- Riesgos: problemas de orden de arranque, hostnames incorrectos, falta de persistencia de volumenes.

### `Dockerfile`
- Proposito: Construye y ejecuta la imagen del contenedor API.
- Documentar al cambiar: etapas de build, usuario de runtime, assets copiados, comando, puerto expuesto.
- Riesgos: runtime inseguro, imagenes grandes, dependencias de produccion faltantes.

### `package.json`
- Proposito: metadatos del proyecto, dependencias y scripts.
- Documentar al cambiar: contrato de scripts (`dev`, `build`, `start`, `db:*`, `test:*`), actualizaciones de dependencias.
- Personalizacion: `name` y `description` se generan desde `PROJECT_SLUG` via `npm run naming:sync`.
- Riesgos: flujo de desarrollo roto, versiones incompatibles de paquetes.

### `scripts/sync-project-metadata.js`
- Proposito: sincroniza metadatos de paquete (`package.json`, `package-lock.json`) desde `PROJECT_SLUG` en `.env`.
- Documentar al cambiar: reglas de parseo del slug, formato de descripcion generada, archivos actualizados.
- Riesgos: desalineacion entre naming de entorno y metadatos del paquete si no se ejecuta tras cambiar el slug.

### `tsconfig.json`
- Proposito: comportamiento del compilador TypeScript.
- Documentar al cambiar: strictness, target/module, includes/excludes de rutas, directorio de salida.
- Riesgos: incompatibilidades en runtime, regresiones de tipos.

### `jest.config.js`
- Proposito: configuracion del test runner.
- Documentar al cambiar: roots, patrones de test, transform, configuracion de cobertura.
- Riesgos: tests no detectados, cobertura inexacta.

### `nodemon.json`
- Proposito: configuracion de recarga automatica local para desarrollo.
- Documentar al cambiar: rutas observadas, rutas ignoradas, comando ejecutado.
- Riesgos: bucles de recarga costosos o comportamiento de recarga obsoleto.

### `sequelize.config.js`
- Proposito: configuracion de sequelize-cli para migraciones/seeders.
- Documentar al cambiar: mapeo de entornos, dialecto, fuente de credenciales host/puerto.
- Riesgos: migraciones ejecutadas contra una base de datos incorrecta.

### `README.md`
- Proposito: onboarding y operaciones rapidas.
- Documentar al cambiar: flujo de arranque, variables de entorno, mapa de documentacion, instrucciones de personalizacion de nombre.
- Riesgos: desalineacion en onboarding y fallos repetidos de setup.

### `LICENSE`
- Proposito: terminos legales de uso.
- Documentar al cambiar: tipo de licencia e implicaciones.
- Riesgos: ambiguedad legal.

## Carpeta Docs

### `docs/ARCHITECTURE.md`
- Proposito: modelo de clean architecture y reglas de dependencia.
- Documentar al cambiar: responsabilidades por capa, limites entre capas, estrategia de seguridad/observabilidad.
- Riesgos: deriva arquitectonica y direccion de dependencias incorrecta.

### `docs/INSTALLATION.md`
- Proposito: configuracion de entorno y ejecucion de comandos.
- Documentar al cambiar: flujo docker-first, flujo local, proceso de migracion/seed.
- Riesgos: setup incompleto, secuencia de arranque fallida.

### `docs/PROJECT_CUSTOMIZATION.md`
- Proposito: checklist corto de renombre para la plantilla, servicios Docker y metadatos del proyecto.
- Documentar al cambiar: variables de naming, pasos de setup orientados al usuario.
- Riesgos: instrucciones de renombre desactualizadas.

### `docs/FILES_REFERENCE.md`
- Proposito: responsabilidad archivo por archivo y checklist de documentacion.
- Documentar al cambiar: responsabilidades de archivos y expectativas de actualizacion.

### `docs/REQUEST_FLOWS.md`
- Proposito: flujo request-response por grupo de rutas.
- Documentar al cambiar: orden de middlewares, comportamiento de validacion/auth, contratos de respuesta.

### `docs/TROUBLESHOOTING.md`
- Proposito: fallos comunes y soluciones rapidas.
- Documentar al cambiar: problemas recurrentes y remediaciones comprobadas.

## Codigo Fuente

### Puntos De Entrada

#### `src/main.ts`
- Proposito: bootstrap del proceso (cargar app, conectar DB, escuchar).
- Documentar al cambiar: secuencia de arranque, manejo de errores fatales, comportamiento de apagado.
- Riesgos: la app parece levantada sin disponibilidad real de DB.

#### `src/app.ts`
- Proposito: composicion de la app Express.
- Documentar al cambiar: orden de middlewares, configuraciones globales, puntos de montaje de routers, manejadores de error.
- Riesgos: bypass de middlewares de seguridad o propagacion de errores rota.

### Capa Application

#### `src/application/dto/auth.dto.ts`
- Proposito: contratos de datos de auth entre presentation y application.
- Documentar al cambiar: campos DTO, forma del payload (`sub`, `email`, `role`), contratos de salida de tokens.
- Riesgos: desajuste de contrato entre controller y services.

#### `src/application/services/HashService.ts`
- Proposito: abstraccion de hash/comparacion de contrasenas.
- Documentar al cambiar: origen de salt rounds, garantias de metodos, comportamiento ante fallos.
- Riesgos: politica de hash inconsistente.

#### `src/application/services/TokenService.ts`
- Proposito: firmado/verificacion JWT y creacion de pares de tokens.
- Documentar al cambiar: secretos de tokens, expiraciones, comportamiento de verificacion, errores lanzados.
- Riesgos: supuestos invalidos de auth y mal uso de tokens.

#### `src/application/use-cases/auth/RegisterUseCase.ts`
- Proposito: orquestacion del flujo de registro.
- Documentar al cambiar: secuencia (verificar usuario existente, hashear contrasena, crear usuario, emitir tokens), posibles conflictos.
- Riesgos: emails duplicados y errores en asignacion de roles.

#### `src/application/use-cases/auth/RefreshTokenUseCase.ts`
- Proposito: orquestacion del flujo de refresh token.
- Documentar al cambiar: requisitos de verificacion y comportamiento de reemision.
- Riesgos: mal uso del refresh o escenarios con usuario desactualizado.

### Capa Config

#### `src/config/environment.ts`
- Proposito: carga de entorno y validacion Joi.
- Documentar al cambiar: variables requeridas, defaults, restricciones del schema.
- Personalizacion: valida `PROJECT_SLUG` y deriva metadatos de la app desde esa variable.
- Riesgos: caidas en runtime por desalineacion de configuracion.

#### `src/config/swagger.ts`
- Proposito: configuracion de generacion OpenAPI.
- Documentar al cambiar: archivos de rutas escaneados, metadatos base, comportamiento del endpoint de docs.
- Personalizacion: titulo y descripcion de Swagger se derivan desde `PROJECT_SLUG` via configuracion de entorno.
- Riesgos: documentacion API desalineada con runtime.

### Capa Domain

#### `src/domain/entities/User.ts`
- Proposito: entidad de usuario y comportamiento de dominio.
- Documentar al cambiar: invariantes, semantica de roles, campos sensibles.
- Riesgos: fuga de password hash y reglas de dominio debiles.

#### `src/domain/interfaces/IUserRepository.ts`
- Proposito: contrato de repositorio para persistencia de usuarios.
- Documentar al cambiar: garantias de metodos, semantica de null, tipos de entrada.
- Riesgos: inconsistencias de implementacion.

### Capa Infrastructure

#### `src/infrastructure/auth/passport.ts`
- Proposito: wiring de estrategias Passport local y JWT.
- Documentar al cambiar: ruta de verificacion de credenciales, extraccion de token, forma de usuario adjunto.
- Riesgos: bypass de autenticacion o fallos inesperados.

#### `src/infrastructure/database/sequelize.ts`
- Proposito: instancia Sequelize y opciones de conexion.
- Documentar al cambiar: opciones de pool, comportamiento de logging, restricciones especificas del dialecto.
- Riesgos: conexiones inestables bajo carga.

#### `src/infrastructure/database/models/UserModel.ts`
- Proposito: schema ORM para la tabla users.
- Documentar al cambiar: columnas, restricciones, defaults, opciones del modelo.
- Riesgos: desajuste de schema con migraciones.

#### `src/infrastructure/database/repositories/UserRepository.ts`
- Proposito: implementacion concreta de `IUserRepository`.
- Documentar al cambiar: mapeo entre ORM y domain, comportamiento metodo por metodo.
- Riesgos: bugs de persistencia y mal uso de null/error.

#### `src/infrastructure/database/migrations/202604010001-create-users-table.js`
- Proposito: crear la tabla users.
- Documentar al cambiar: contrato `up` y `down`, estrategia de indices.
- Riesgos: operaciones de schema irreversibles.

#### `src/infrastructure/database/seeders/202604010001-seed-admin-user.js`
- Proposito: creacion inicial de cuenta admin.
- Documentar al cambiar: variables de entorno requeridas, supuestos de idempotencia.
- Riesgos: registros admin duplicados o credenciales sembradas debiles.

#### `src/infrastructure/logger/levels.ts`
- Proposito: mapeo de niveles de log.
- Documentar al cambiar: orden de niveles y uso esperado.

#### `src/infrastructure/logger/formats.ts`
- Proposito: formato de logs y redaccion de datos sensibles.
- Documentar al cambiar: claves redactadas, campos estructurados, formatos console vs json.
- Riesgos: fuga de secretos en logs.

#### `src/infrastructure/logger/logger.ts`
- Proposito: instancia de logger Winston y transports.
- Documentar al cambiar: destinos de salida, rotacion/retencion, manejadores de excepciones.
- Riesgos: observabilidad incompleta o logs sin limite.

#### `src/infrastructure/logger/morgan.middleware.ts`
- Proposito: adaptador de logging para requests HTTP.
- Documentar al cambiar: tokens, logica de skip, comportamiento de correlation-id.

#### `src/infrastructure/logger/requestContext.middleware.ts`
- Proposito: propagacion de correlation-id.
- Documentar al cambiar: contrato del header y comportamiento de generacion.
- Riesgos: huecos de trazabilidad entre requests.

### Capa Presentation

#### Controllers

##### `src/presentation/controllers/AuthController.ts`
- Proposito: handlers HTTP de auth.
- Documentar al cambiar: comportamiento de endpoints, codigos de estado en exito/error, dependencias de servicios.

##### `src/presentation/controllers/UserController.ts`
- Proposito: handlers HTTP CRUD de usuarios.
- Documentar al cambiar: restricciones de rol, verificaciones de conflicto, forma de proyeccion de respuesta.

#### Middlewares

##### `src/presentation/middlewares/auth.middleware.ts`
- Proposito: utilidades de middleware authN/authZ.
- Documentar al cambiar: comportamiento de `authenticateJwt`, `authorizeRoles`, `authorizeAdminOrSelf`.

##### `src/presentation/middlewares/currentUser.middleware.ts`
- Proposito: extraer de forma segura el usuario autenticado desde el contexto de request.
- Documentar al cambiar: supuestos y errores lanzados.

##### `src/presentation/middlewares/errorHandler.ts`
- Proposito: manejo global de errores y not-found.
- Documentar al cambiar: schema de respuesta de error y exposicion de detalle dependiente del entorno.

##### `src/presentation/middlewares/security.middleware.ts`
- Proposito: politicas de helmet, cors y rate-limit.
- Documentar al cambiar: origen de politicas (`env`), logica de allowlist, valores de ventana/limite.

##### `src/presentation/middlewares/validate.middleware.ts`
- Proposito: puente de validacion Joi para body/query/params.
- Documentar al cambiar: opciones de validacion y comportamiento de normalizacion.

#### Routes

##### `src/presentation/routes/auth.routes.ts`
- Proposito: registro de rutas de auth.
- Documentar al cambiar: path de ruta, cadena de middlewares, schema de validacion, metodo del controller.

##### `src/presentation/routes/health.routes.ts`
- Proposito: endpoint de health check.
- Documentar al cambiar: forma de respuesta y expectativa de monitoreo.

##### `src/presentation/routes/index.ts`
- Proposito: punto de entrada de composicion de routers.
- Documentar al cambiar: sub-rutas montadas y prefijos.

##### `src/presentation/routes/users.routes.ts`
- Proposito: registro de rutas de usuarios.
- Documentar al cambiar: autorizacion a nivel de ruta y cadena de validacion.

#### Validators

##### `src/presentation/validators/auth.validators.ts`
- Proposito: schemas Joi para requests de auth.
- Documentar al cambiar: restricciones de campos y justificacion de validacion.

##### `src/presentation/validators/user.validators.ts`
- Proposito: schemas Joi para requests de usuario.
- Documentar al cambiar: diferencias create/update y restricciones de rol.

### Shared

#### `src/shared/errors/AppError.ts`
- Proposito: errores de aplicacion normalizados.
- Documentar al cambiar: subclases, mapeo de estados, semantica del `code` legible por maquina.

#### `src/shared/types/express.d.ts`
- Proposito: ampliacion de tipos de express.
- Documentar al cambiar: campos adicionales de request/user y su origen.

#### `src/shared/utils/asyncHandler.ts`
- Proposito: envoltorio async para controllers.
- Documentar al cambiar: contrato de propagacion de rechazo de promesas.

## Definicion De Terminado Para Cambios De Documentacion

Cuando modifiques cualquier archivo anterior, actualiza la documentacion hasta cumplir todos estos puntos:

1. El proposito sigue siendo correcto.
2. Entradas/salidas quedan reflejadas.
3. El comportamiento sensible de seguridad esta documentado (si aplica).
4. El comportamiento de errores esta documentado (si aplica).
5. Los enlaces a documentacion relacionada siguen siendo validos.
