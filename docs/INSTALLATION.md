# Installation

## Requirements

- Node.js 22+
- Docker + Docker Compose

## Docker-first startup

1. Copy `.env.example` to `.env` if needed for local non-docker runs.
2. Run `docker compose up --build`.
3. Run migrations: `npm run db:migrate`.
4. Seed admin user: `npm run db:seed`.
5. API: `http://localhost:3000`.
6. Swagger: `http://localhost:3000/api-docs`.
7. phpMyAdmin: `http://localhost:8081`.

## Node local startup

1. Install dependencies: `npm install`.
2. Configure `.env`.
3. Run migrations: `npm run db:migrate`.
4. Seed admin user: `npm run db:seed`.
5. Run `npm run dev`.
