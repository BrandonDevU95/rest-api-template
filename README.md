# REST API Template

Professional backend template with Clean Architecture using TypeScript, Express, Sequelize, MySQL, Passport-Local, JWT, Joi, Winston/Morgan, and Swagger.

## Quick Start

1. Install dependencies
2. Copy `.env.example` to `.env`
3. Fill every required variable in `.env` before starting the app; startup now fails if any mandatory value is missing
4. Sync project metadata from `PROJECT_SLUG`: `npm run naming:sync`
5. Start with Docker: `docker compose up --build`
6. Run migrations inside the API container: `docker compose exec api npm run db:migrate`
7. Seed admin user inside the API container: `docker compose exec api npm run db:seed`
8. Open Swagger at `http://localhost:3000/api-docs`

The `.env.example` file is only a template. The API, database containers, and Sequelize CLI all read from `.env`, so the file must contain the full configuration before booting the project.

## Project Naming Customization (Centralized)

To fully personalize the project name without searching folder-by-folder, update only these files:

1. `.env` (single source through `PROJECT_SLUG`)
2. Run `npm run naming:sync` to update package metadata from `PROJECT_SLUG`

Main naming variables in `.env`:

| Variable | Purpose |
| --- | --- |
| `PROJECT_SLUG` | Master variable. Derives Docker project name, container names, network name, app name in logs/Swagger title, and Swagger description. |

### Development Flow

#### First Time Setup

Use `docker compose up --build` the first time you clone the project or whenever you change `package.json` or `Dockerfile`. The `--build` flag rebuilds the image so Docker can pick up dependency or image-level changes, but it does not mean the app is running in production.

#### Daily Development

For normal day-to-day work, use `docker compose up` after the containers already exist. With the current setup, the API runs in development mode inside the container and reloads through `npm run dev`, so code changes do not require a rebuild.

#### When to Rebuild

Use `docker compose up --build` again only when you change:
- `package.json`
- `Dockerfile`
- dependencies
- image-level setup

#### Database Workflow

- Run database commands from inside the `api` container because `.env` uses `DB_HOST=mysql`, which only resolves inside the Docker network.
- Use `docker compose exec api npm run db:migrate` when you create a new migration or start from a fresh database.
- Use `docker compose exec api npm run db:seed` when you need to load initial data again, such as after recreating the database or adding a new seed.
- You do not need to run them on every start; Sequelize tracks applied migrations, and seeds are only for initial or repeatable data loads.
- If you run `npm run db:migrate` from your host shell with `DB_HOST=mysql`, you will get `getaddrinfo ENOTFOUND mysql`.

### Required Environment Variables

#### Application

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Defines the runtime mode used by the app and error handling. |
| `PORT` | Port where the API listens. |
| `API_PREFIX` | Base path for all API routes. |
| `PROJECT_SLUG` | Master naming value used to derive app and Docker names. |
| `JWT_ACCESS_SECRET` | Secret used to sign and verify access tokens. |
| `JWT_ACCESS_EXPIRES_IN` | Expiration for access tokens. |
| `JWT_REFRESH_SECRET` | Secret used to sign and verify refresh tokens. |
| `JWT_REFRESH_EXPIRES_IN` | Expiration for refresh tokens. |
| `BCRYPT_SALT_ROUNDS` | BCrypt cost factor used for password hashing. |
| `CORS_ORIGIN` | Allowed origins for browser requests. |
| `LOG_LEVEL` | Minimum log level for the application logger. |
| `LOG_DIR` | Directory where log files are written. |
| `RATE_LIMIT_WINDOW_MS` | Time window for request rate limiting. |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests allowed per window for general traffic. |
| `RATE_LIMIT_LOGIN_MAX_REQUESTS` | Maximum requests allowed per window for login attempts. |

#### Database and Docker

| Variable | Purpose |
| --- | --- |
| `DB_HOST` | MySQL host used by the API and Sequelize CLI. |
| `DB_PORT` | MySQL port used by the API and Sequelize CLI. |
| `DB_NAME` | Database name used by the API and Sequelize CLI. |
| `DB_USER` | Database user used by the API and Sequelize CLI. |
| `DB_PASSWORD` | Database password used by the API and Sequelize CLI. |
| `DB_LOGGING` | Enables or disables Sequelize SQL logging. |
| `MYSQL_ROOT_PASSWORD` | MySQL root password used by the Docker container. |
| `MYSQL_DATABASE` | Initial MySQL database created by Docker. |
| `MYSQL_USER` | MySQL user created by Docker. |
| `MYSQL_PASSWORD` | MySQL password created by Docker. |
| `PMA_HOST` | phpMyAdmin host when running with Docker. |
| `PMA_PORT` | phpMyAdmin port when running with Docker. |
| `PMA_USER` | phpMyAdmin database user when running with Docker. |
| `PMA_PASSWORD` | phpMyAdmin database password when running with Docker. |

#### Seeder

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAIL` | Email used by the admin seed script. |
| `ADMIN_PASSWORD` | Password used by the admin seed script. |

Default admin seed credentials:
- Email: `admin@template.local`
- Password: `Admin123!`

### Documentation Map

- `README.md`: quick onboarding, development flow, and required environment variables.
- `docs/INSTALLATION.md`: detailed installation and command execution for Docker and local modes.
- `docs/ARCHITECTURE.md`: layered architecture, dependency rule, and technical design strategy.
- `docs/FILES_REFERENCE.md`: file-by-file guide with purpose, update expectations, and documentation checklist.
- `docs/PROJECT_CUSTOMIZATION.md`: quick rename guide for project, containers, and Docker network.
- `docs/REQUEST_FLOWS.md`: request pipeline and endpoint behavior by route group.
- `docs/TROUBLESHOOTING.md`: common setup/runtime failures and remediations.

## Documentation Maintenance

Use this checklist whenever code changes affect behavior, contracts, or operations:

1. Update `docs/FILES_REFERENCE.md` if file purpose or ownership changed.
2. Update `docs/REQUEST_FLOWS.md` if middleware chain, validation, auth, or response contract changed.
3. Update `docs/INSTALLATION.md` or `docs/TROUBLESHOOTING.md` if setup/runtime commands or failure modes changed.
4. Update `docs/ARCHITECTURE.md` if layer responsibilities or dependency direction changed.
5. Verify `README.md` still links to all current documentation files.

Definition of done for documentation updates:

- Purpose of changed files remains accurate.
- Inputs/outputs and error behavior are reflected.
- Security-sensitive behavior (auth, secrets, logging) is documented.
- Any new recurring issue has a troubleshooting entry.
