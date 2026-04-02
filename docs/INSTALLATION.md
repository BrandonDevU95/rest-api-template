# Installation

## Requirements

- Node.js 22+
- Docker + Docker Compose

## Docker-first Startup (Recommended)

1. Copy `.env.example` to `.env`.
2. Fill every required variable in `.env`.
3. Start services: `docker compose up --build`.
4. Run migrations inside the API container: `docker compose exec api npm run db:migrate`.
5. Seed admin user inside the API container: `docker compose exec api npm run db:seed`.
6. API: `http://localhost:3000`.
7. Swagger: `http://localhost:3000/api-docs`.
8. phpMyAdmin: `http://localhost:8081`.

Notes:
- Use `docker compose up` for daily work after the first successful build.
- Use `docker compose up --build` again only when `package.json`, `Dockerfile`, or image-level dependencies change.
- Database commands must run inside the `api` container because `.env` uses `DB_HOST=mysql`, which resolves only inside the Docker network.

## Database Commands

- Apply migrations: `docker compose exec api npm run db:migrate`
- Revert one migration: `docker compose exec api npm run db:migrate:undo`
- Seed initial data: `docker compose exec api npm run db:seed`

When to run them:
- Run migrations when you add a new migration or start from a fresh database.
- Run seeds when you need initial data again, such as after recreating the database.
- Do not run them on every start. Sequelize tracks applied migrations.

## Node Local Startup (Without Docker)

Use this mode only if you run MySQL outside Docker and point `.env` to that host (for example `DB_HOST=localhost`).

1. Install dependencies: `npm install`.
2. Configure `.env` for local database access.
3. Run migrations: `npm run db:migrate`.
4. Seed admin user: `npm run db:seed`.
5. Run API: `npm run dev`.

## Related Docs

- Project overview and quick start: `README.md`
- Architecture and design decisions: `docs/ARCHITECTURE.md`
- File-by-file guide: `docs/FILES_REFERENCE.md`
- Request/response execution flow: `docs/REQUEST_FLOWS.md`
- Common failures and fixes: `docs/TROUBLESHOOTING.md`
