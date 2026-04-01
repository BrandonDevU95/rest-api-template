# API Backend Boilerplate

Professional backend boilerplate with Clean Architecture using TypeScript, Express, Sequelize, MySQL, Passport-Local, JWT, Joi, Winston/Morgan, and Swagger.

## Quick Start

1. Install dependencies
2. Copy `.env.example` to `.env`
3. Fill every required variable in `.env` before starting the app; startup now fails if any mandatory value is missing
4. Start with Docker: `docker compose up --build`
5. Run migrations: `npm run db:migrate`
6. Seed admin user: `npm run db:seed`
7. Open Swagger at `http://localhost:3000/api-docs`

The `.env.example` file is only a template. The API, database containers, and Sequelize CLI all read from `.env`, so the file must contain the full configuration before booting the project.

### Required Environment Variables

#### Application

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Defines the runtime mode used by the app and error handling. |
| `PORT` | Port where the API listens. |
| `API_PREFIX` | Base path for all API routes. |
| `APP_NAME` | Application name used in logs and metadata. |
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
- Email: `admin@boilerplate.com`
- Password: `Admin123!`

Detailed documentation will be added under `docs/`.
