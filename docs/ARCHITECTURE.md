# Arquitectura

Este documento describe el diseno del sistema y las responsabilidades por capa.
Para comandos de setup y ejecucion, consulta `docs/INSTALLATION.md`.

Este proyecto sigue un estilo de Clean Architecture por capas:

1. Domain: entidades de negocio y contratos de repositorio.
2. Application: casos de uso, DTOs y orquestacion de servicios.
3. Infrastructure: modelos/repositorios Sequelize, estrategias Passport e implementacion de logging.
4. Presentation: rutas/controladores y middlewares de Express.

## Regla De Dependencias

Las capas internas no dependen de capas externas.

- Domain no tiene dependencia de framework.
- Application depende de abstracciones de Domain.
- Infrastructure implementa contratos de Domain/Application.
- Presentation depende de Application y del wiring de Infrastructure.

## Estrategia De Seguridad

- Passport Local valida credenciales en login.
- JWT protege rutas privadas mediante bearer token.
- Middleware RBAC aplica acceso basado en roles.
- Joi valida contratos de request.

## Estrategia De Observabilidad

- Winston maneja logs estructurados de app y errores.
- Morgan registra requests HTTP con correlation id.
- Los campos sensibles se redactan antes de persistir.

## Navegacion Del Codigo

- Puntos de entrada: `src/main.ts`, `src/app.ts`.
- Capa Presentation: `src/presentation/*` (routes, controllers, middlewares, validators).
- Capa Application: `src/application/*` (use cases, DTOs, services).
- Capa Domain: `src/domain/*` (entities y repository contracts).
- Capa Infrastructure: `src/infrastructure/*` (implementaciones de database, auth y logging).
- Utilidades compartidas: `src/shared/*`.

## Documentacion Relacionada

- Referencia archivo por archivo: `docs/FILES_REFERENCE.md`
- Pipeline de requests y flujo de endpoints: `docs/REQUEST_FLOWS.md`
- Troubleshooting de setup/ejecucion: `docs/TROUBLESHOOTING.md`
