# Instalacion

## Requisitos

- Node.js 22+
- Docker + Docker Compose

## Arranque Con Docker (Recomendado)

1. Copia `.env.example` a `.env`.
2. Personaliza la variable de naming en `.env` (`PROJECT_SLUG`).
3. Completa todas las demas variables requeridas en `.env`.
4. Sincroniza metadatos del paquete: `npm run naming:sync`.
5. Inicia servicios: `docker compose up --build`.
6. Ejecuta migraciones dentro del contenedor API: `docker compose exec api npm run db:migrate`.
7. Ejecuta el seeder del usuario admin dentro del contenedor API: `docker compose exec api npm run db:seed`.
8. API: `http://localhost:3000`.
9. Swagger: `http://localhost:3000/api-docs`.
10. phpMyAdmin: `http://localhost:8081`.

Notas:
- Usa `docker compose up` para el trabajo diario despues del primer build exitoso.
- Vuelve a usar `docker compose up --build` solo cuando cambien `package.json`, `Dockerfile` o dependencias a nivel de imagen.
- Los comandos de base de datos deben ejecutarse dentro del contenedor `api` porque `.env` usa `DB_HOST=mysql`, que solo resuelve dentro de la red Docker.

## Comandos De Base De Datos

- Aplicar migraciones: `docker compose exec api npm run db:migrate`
- Revertir una migracion: `docker compose exec api npm run db:migrate:undo`
- Cargar datos iniciales: `docker compose exec api npm run db:seed`

Cuando ejecutarlos:
- Ejecuta migraciones al agregar una migracion nueva o iniciar desde una base de datos vacia.
- Ejecuta seeds cuando necesites datos iniciales nuevamente, por ejemplo despues de recrear la base de datos.
- No los ejecutes en cada inicio. Sequelize registra las migraciones aplicadas.

## Reinicio Limpio Del Proyecto

Si quieres destruir contenedores y eliminar tambien los datos persistidos (incluyendo MySQL), usa:

- `docker compose down -v`

Si ademas quieres remover contenedores huerfanos del compose actual:

- `docker compose down -v --remove-orphans`

Despues de eso, levanta de nuevo el stack:

- `docker compose up --build`

Y luego ejecuta migraciones y seed segun corresponda:

- `docker compose exec api npm run db:migrate`
- `docker compose exec api npm run db:seed`

Advertencia:
- `-v` elimina volumenes nombrados del proyecto (por ejemplo el volumen de MySQL), por lo tanto se pierde toda la data persistida.

## Arranque Local Con Node (Sin Docker)

Usa este modo solo si ejecutas MySQL fuera de Docker y apuntas `.env` a ese host (por ejemplo `DB_HOST=localhost`).

1. Instala dependencias: `npm install`.
2. Configura `.env` para acceso local a base de datos.
3. Ejecuta migraciones: `npm run db:migrate`.
4. Ejecuta el seeder de admin: `npm run db:seed`.
5. Inicia la API: `npm run dev`.

## Documentacion Relacionada

- Vista general del proyecto e inicio rapido: `README.md`
- Guia rapida de renombre: `docs/PROJECT_CUSTOMIZATION.md`
- Arquitectura y decisiones de diseno: `docs/ARCHITECTURE.md`
- Guia archivo por archivo: `docs/FILES_REFERENCE.md`
- Flujo de ejecucion request/response: `docs/REQUEST_FLOWS.md`
- Fallos comunes y soluciones: `docs/TROUBLESHOOTING.md`
