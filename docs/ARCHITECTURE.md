# Architecture

This document describes system design and layer responsibilities.
For setup and runtime commands, see `docs/INSTALLATION.md`.

This project follows a layered Clean Architecture style:

1. Domain: business entities and repository contracts.
2. Application: use cases, DTOs, and service orchestration.
3. Infrastructure: Sequelize models/repositories, Passport strategies, logger implementation.
4. Presentation: Express routes/controllers and middlewares.

## Dependency Rule

Inner layers do not depend on outer layers.

- Domain has no framework dependency.
- Application depends on Domain abstractions.
- Infrastructure implements Domain/Application contracts.
- Presentation depends on Application and Infrastructure wiring.

## Security Strategy

- Passport Local validates credentials on login.
- JWT protects private routes with bearer token.
- RBAC middleware enforces role-based access.
- Joi validates request contracts.

## Observability Strategy

- Winston handles structured app and error logs.
- Morgan logs HTTP requests with correlation id.
- Sensitive fields are redacted before persistence.

## Codebase Navigation

- Entry points: `src/main.ts`, `src/app.ts`.
- Presentation layer: `src/presentation/*` (routes, controllers, middlewares, validators).
- Application layer: `src/application/*` (use cases, DTOs, services).
- Domain layer: `src/domain/*` (entities and repository contracts).
- Infrastructure layer: `src/infrastructure/*` (database, auth, logging implementations).
- Shared utilities: `src/shared/*`.

## Related Docs

- File-by-file reference: `docs/FILES_REFERENCE.md`
- Request pipeline and endpoint flow: `docs/REQUEST_FLOWS.md`
- Setup/runtime troubleshooting: `docs/TROUBLESHOOTING.md`
