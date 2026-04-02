# Files Reference

This document explains the purpose of each file in the repository and what should be documented when changing it.

## Root Files

### `docker-compose.yml`
- Purpose: Orchestrates local services (api, mysql, phpmyadmin).
- Document when changed: services, ports, volumes, healthchecks, dependencies.
- Risks: startup order issues, incorrect hostnames, missing volume persistence.

### `Dockerfile`
- Purpose: Builds and runs API container image.
- Document when changed: build stages, runtime user, copied assets, command, exposed port.
- Risks: insecure runtime, large images, missing production dependencies.

### `package.json`
- Purpose: project metadata, dependencies, scripts.
- Document when changed: scripts contract (`dev`, `build`, `start`, `db:*`, `test:*`), dependency upgrades.
- Risks: broken developer workflow, incompatible package versions.

### `tsconfig.json`
- Purpose: TypeScript compiler behavior.
- Document when changed: strictness, target/module, path includes/excludes, output dir.
- Risks: runtime incompatibility, typing regressions.

### `jest.config.js`
- Purpose: test runner configuration.
- Document when changed: roots, test patterns, transform, coverage settings.
- Risks: tests not discovered, inaccurate coverage.

### `nodemon.json`
- Purpose: local auto-reload settings for dev.
- Document when changed: watch paths, ignored paths, executed command.
- Risks: expensive reload loops or stale reload behavior.

### `sequelize.config.js`
- Purpose: sequelize-cli config for migrations/seeders.
- Document when changed: env mapping, dialect, host/port credentials source.
- Risks: migrations run against wrong database.

### `README.md`
- Purpose: onboarding and quick operations.
- Document when changed: startup flow, env variables, docs map.
- Risks: onboarding drift and repeated setup failures.

### `LICENSE`
- Purpose: legal usage terms.
- Document when changed: license type and implications.
- Risks: legal ambiguity.

## Docs Folder

### `docs/ARCHITECTURE.md`
- Purpose: clean architecture model and dependency rules.
- Document when changed: layer responsibilities, cross-layer boundaries, security/observability strategy.
- Risks: architecture drift and wrong dependency direction.

### `docs/INSTALLATION.md`
- Purpose: environment setup and command execution.
- Document when changed: docker-first workflow, local workflow, migration/seed process.
- Risks: incomplete setup, failing boot sequence.

### `docs/FILES_REFERENCE.md`
- Purpose: file-by-file ownership and documentation checklist.
- Document when changed: file responsibilities and update expectations.

### `docs/REQUEST_FLOWS.md`
- Purpose: request to response flow by route group.
- Document when changed: middleware order, validation/auth behavior, response contracts.

### `docs/TROUBLESHOOTING.md`
- Purpose: common failures and quick fixes.
- Document when changed: recurring issues and proven remediations.

## Source Code

### Entry Points

#### `src/main.ts`
- Purpose: process bootstrap (load app, connect DB, listen).
- Document when changed: startup sequence, fatal error handling, shutdown behavior.
- Risks: app appears up without DB readiness.

#### `src/app.ts`
- Purpose: Express app composition.
- Document when changed: middleware order, global settings, router mount points, error handlers.
- Risks: security middleware bypass or broken error propagation.

### Application Layer

#### `src/application/dto/auth.dto.ts`
- Purpose: auth data contracts between presentation and application.
- Document when changed: DTO fields, payload shape (`sub`, `email`, `role`), output token contracts.
- Risks: contract mismatch between controller and services.

#### `src/application/services/HashService.ts`
- Purpose: password hash/compare abstraction.
- Document when changed: salt rounds source, method guarantees, failure behavior.
- Risks: inconsistent hashing policy.

#### `src/application/services/TokenService.ts`
- Purpose: JWT sign/verify and token pair creation.
- Document when changed: token secrets, expirations, verification behavior, thrown errors.
- Risks: invalid auth assumptions and token misuse.

#### `src/application/use-cases/auth/RegisterUseCase.ts`
- Purpose: register flow orchestration.
- Document when changed: sequence (check existing user, hash password, create user, issue tokens), possible conflicts.
- Risks: duplicated emails and role assignment mistakes.

#### `src/application/use-cases/auth/RefreshTokenUseCase.ts`
- Purpose: refresh-token flow orchestration.
- Document when changed: verification requirements and reissue behavior.
- Risks: refresh misuse or stale-user scenarios.

### Config Layer

#### `src/config/environment.ts`
- Purpose: env loading and Joi validation.
- Document when changed: required variables, defaults, schema constraints.
- Risks: runtime crashes due to config drift.

#### `src/config/swagger.ts`
- Purpose: OpenAPI generation setup.
- Document when changed: scanned route files, base metadata, docs endpoint behavior.
- Risks: API docs not matching runtime.

### Domain Layer

#### `src/domain/entities/User.ts`
- Purpose: user entity and domain behavior.
- Document when changed: invariants, role semantics, sensitive fields.
- Risks: leaking password hash and weak domain rules.

#### `src/domain/interfaces/IUserRepository.ts`
- Purpose: repository contract for user persistence.
- Document when changed: method guarantees, null semantics, input types.
- Risks: implementation inconsistencies.

### Infrastructure Layer

#### `src/infrastructure/auth/passport.ts`
- Purpose: Passport local and JWT strategy wiring.
- Document when changed: credential verification path, token extraction, attached user shape.
- Risks: authentication bypass or unexpected failures.

#### `src/infrastructure/database/sequelize.ts`
- Purpose: Sequelize instance and connection options.
- Document when changed: pool options, logging behavior, dialect-specific constraints.
- Risks: unstable connections under load.

#### `src/infrastructure/database/models/UserModel.ts`
- Purpose: ORM schema for users table.
- Document when changed: columns, constraints, defaults, model options.
- Risks: schema mismatch with migrations.

#### `src/infrastructure/database/repositories/UserRepository.ts`
- Purpose: concrete implementation of `IUserRepository`.
- Document when changed: mapping between ORM and domain, method-by-method behavior.
- Risks: persistence bugs and null/error misuse.

#### `src/infrastructure/database/migrations/202604010001-create-users-table.js`
- Purpose: create users table.
- Document when changed: `up` and `down` contract, index strategy.
- Risks: irreversible schema operations.

#### `src/infrastructure/database/seeders/202604010001-seed-admin-user.js`
- Purpose: initial admin account creation.
- Document when changed: required env vars, idempotency assumptions.
- Risks: duplicate admin records or weak seeded credentials.

#### `src/infrastructure/logger/levels.ts`
- Purpose: log level mapping.
- Document when changed: level ordering and expected usage.

#### `src/infrastructure/logger/formats.ts`
- Purpose: log formatting and sensitive-data redaction.
- Document when changed: redacted keys, structured fields, console vs json formats.
- Risks: leaking secrets in logs.

#### `src/infrastructure/logger/logger.ts`
- Purpose: Winston logger instance and transports.
- Document when changed: output targets, rotation/retention, exception handlers.
- Risks: missing observability or unbounded logs.

#### `src/infrastructure/logger/morgan.middleware.ts`
- Purpose: HTTP request logging adapter.
- Document when changed: tokens, skip logic, correlation-id behavior.

#### `src/infrastructure/logger/requestContext.middleware.ts`
- Purpose: correlation-id propagation.
- Document when changed: header contract and generation behavior.
- Risks: tracing gaps across requests.

### Presentation Layer

#### Controllers

##### `src/presentation/controllers/AuthController.ts`
- Purpose: HTTP auth handlers.
- Document when changed: endpoint behavior, success/error status codes, service dependencies.

##### `src/presentation/controllers/UserController.ts`
- Purpose: HTTP user CRUD handlers.
- Document when changed: role restrictions, conflict checks, response projection shape.

#### Middlewares

##### `src/presentation/middlewares/auth.middleware.ts`
- Purpose: authN/authZ middleware utilities.
- Document when changed: `authenticateJwt`, `authorizeRoles`, `authorizeAdminOrSelf` behavior.

##### `src/presentation/middlewares/currentUser.middleware.ts`
- Purpose: safely extract authenticated user from request context.
- Document when changed: assumptions and thrown errors.

##### `src/presentation/middlewares/errorHandler.ts`
- Purpose: global error and not-found handling.
- Document when changed: error response schema and environment-dependent detail exposure.

##### `src/presentation/middlewares/security.middleware.ts`
- Purpose: helmet, cors and rate-limit policies.
- Document when changed: policy source (`env`), allowlist logic, window/limit values.

##### `src/presentation/middlewares/validate.middleware.ts`
- Purpose: Joi validation bridge for body/query/params.
- Document when changed: validation options and normalization behavior.

#### Routes

##### `src/presentation/routes/auth.routes.ts`
- Purpose: auth route registrations.
- Document when changed: route path, middleware chain, validation schema, controller method.

##### `src/presentation/routes/health.routes.ts`
- Purpose: health check endpoint.
- Document when changed: response shape and monitoring expectation.

##### `src/presentation/routes/index.ts`
- Purpose: router composition entrypoint.
- Document when changed: mounted sub-routes and prefixes.

##### `src/presentation/routes/users.routes.ts`
- Purpose: users route registrations.
- Document when changed: route-level authorization and validation chain.

#### Validators

##### `src/presentation/validators/auth.validators.ts`
- Purpose: auth request Joi schemas.
- Document when changed: field constraints and validation rationale.

##### `src/presentation/validators/user.validators.ts`
- Purpose: user request Joi schemas.
- Document when changed: create/update differences and role constraints.

### Shared

#### `src/shared/errors/AppError.ts`
- Purpose: normalized application errors.
- Document when changed: subclasses, status mapping, machine-readable `code` semantics.

#### `src/shared/types/express.d.ts`
- Purpose: express type augmentation.
- Document when changed: additional request/user fields and their source.

#### `src/shared/utils/asyncHandler.ts`
- Purpose: async controller wrapper.
- Document when changed: promise rejection propagation contract.

## Definition of Done for Documentation Changes

When you modify any file above, update documentation until all checks pass:

1. Purpose is still accurate.
2. Inputs/outputs are reflected.
3. Security-sensitive behavior is documented (if applicable).
4. Error behavior is documented (if applicable).
5. Related docs links remain valid.
