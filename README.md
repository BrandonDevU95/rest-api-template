# Plantilla REST API

Plantilla profesional de backend con Clean Architecture usando TypeScript, Express, Sequelize, MySQL, Passport-Local, JWT, Joi, Winston/Morgan y Swagger.

## Inicio Rapido

1. Instala dependencias
2. Copia `.env.example` a `.env`
3. Completa todas las variables requeridas en `.env` antes de iniciar la app; el arranque falla si falta algun valor obligatorio
4. Sincroniza los metadatos del proyecto desde `PROJECT_SLUG`: `npm run naming:sync`
5. Inicia con Docker: `docker compose up --build`
6. Ejecuta migraciones dentro del contenedor de API: `docker compose exec api npm run db:migrate`
7. Ejecuta el seeder del usuario admin dentro del contenedor de API: `docker compose exec api npm run db:seed`
8. Abre Swagger en `http://localhost:3000/api-docs`

El archivo `.env.example` es solo una plantilla. La API, los contenedores de base de datos y Sequelize CLI leen desde `.env`, por lo que ese archivo debe contener la configuracion completa antes de levantar el proyecto.

## Personalizacion Del Nombre Del Proyecto (Centralizada)

Para personalizar por completo el nombre del proyecto sin buscar carpeta por carpeta, actualiza solo esto:

1. `.env` (fuente unica mediante `PROJECT_SLUG`)
2. Ejecuta `npm run naming:sync` para actualizar metadatos del paquete desde `PROJECT_SLUG`

Variables principales de naming en `.env`:

| Variable | Proposito |
| --- | --- |
| `PROJECT_SLUG` | Variable maestra. Deriva el nombre del proyecto Docker, nombres de contenedores, nombre de red, nombre de la app en logs/titulo de Swagger y descripcion de Swagger. |

### Flujo De Desarrollo

#### Configuracion Inicial

Usa `docker compose up --build` la primera vez que clonas el proyecto o cada vez que cambies `package.json` o `Dockerfile`. La bandera `--build` reconstruye la imagen para que Docker tome cambios de dependencias o de nivel de imagen, pero eso no significa que la app este en produccion.

#### Desarrollo Diario

Para el trabajo del dia a dia, usa `docker compose up` cuando los contenedores ya existen. Con la configuracion actual, la API corre en modo desarrollo dentro del contenedor y recarga con `npm run dev`, por lo que los cambios de codigo no requieren rebuild.

#### Cuando Reconstruir

Vuelve a usar `docker compose up --build` solo cuando cambies:
- `package.json`
- `Dockerfile`
- dependencias
- configuracion a nivel de imagen

#### Flujo De Base De Datos

- Ejecuta comandos de base de datos dentro del contenedor `api` porque `.env` usa `DB_HOST=mysql`, que solo resuelve dentro de la red Docker.
- Usa `docker compose exec api npm run db:migrate` cuando crees una nueva migracion o inicies desde una base de datos vacia.
- Usa `docker compose exec api npm run db:seed` cuando necesites cargar datos iniciales nuevamente, por ejemplo al recrear la base de datos o agregar un nuevo seed.
- No necesitas ejecutarlos en cada arranque; Sequelize registra las migraciones aplicadas, y los seeds son para cargas iniciales o repetibles.
- Si ejecutas `npm run db:migrate` desde tu host con `DB_HOST=mysql`, obtendras `getaddrinfo ENOTFOUND mysql`.
- Para reiniciar todo desde cero (incluyendo volumen de MySQL), usa `docker compose down -v` y luego `docker compose up --build`.

### Variables De Entorno Requeridas

#### Aplicacion

| Variable | Proposito |
| --- | --- |
| `NODE_ENV` | Define el modo de ejecucion usado por la app y el manejo de errores. |
| `PORT` | Puerto en el que escucha la API. |
| `API_PREFIX` | Ruta base para todas las rutas de la API. |
| `PROJECT_SLUG` | Valor maestro de naming para derivar nombres de app y Docker. |
| `JWT_ACCESS_SECRET` | Secreto usado para firmar y verificar access tokens. |
| `JWT_ACCESS_EXPIRES_IN` | Expiracion de access tokens. |
| `JWT_REFRESH_SECRET` | Secreto usado para firmar y verificar refresh tokens. |
| `JWT_REFRESH_EXPIRES_IN` | Expiracion de refresh tokens. |
| `BCRYPT_SALT_ROUNDS` | Factor de costo de BCrypt para hash de contrasenas. |
| `CORS_ORIGIN` | Origenes permitidos para solicitudes del navegador. |
| `LOG_LEVEL` | Nivel minimo de logs para el logger de la aplicacion. |
| `LOG_DIR` | Directorio donde se escriben archivos de log. |
| `RATE_LIMIT_WINDOW_MS` | Ventana de tiempo para rate limiting. |
| `RATE_LIMIT_MAX_REQUESTS` | Maximo de solicitudes por ventana para trafico general. |
| `RATE_LIMIT_LOGIN_MAX_REQUESTS` | Maximo de solicitudes por ventana para intentos de login. |

#### Base De Datos Y Docker

| Variable | Proposito |
| --- | --- |
| `DB_HOST` | Host de MySQL usado por la API y Sequelize CLI. |
| `DB_PORT` | Puerto de MySQL usado por la API y Sequelize CLI. |
| `DB_NAME` | Nombre de base de datos usado por la API y Sequelize CLI. |
| `DB_USER` | Usuario de base de datos usado por la API y Sequelize CLI. |
| `DB_PASSWORD` | Contrasena de base de datos usada por la API y Sequelize CLI. |
| `DB_LOGGING` | Habilita o deshabilita logs SQL de Sequelize. |
| `MYSQL_ROOT_PASSWORD` | Contrasena root de MySQL usada por el contenedor Docker. |
| `MYSQL_DATABASE` | Base de datos inicial de MySQL creada por Docker. |
| `MYSQL_USER` | Usuario de MySQL creado por Docker. |
| `MYSQL_PASSWORD` | Contrasena de MySQL creada por Docker. |
| `PMA_HOST` | Host de phpMyAdmin al ejecutar con Docker. |
| `PMA_PORT` | Puerto de phpMyAdmin al ejecutar con Docker. |
| `PMA_USER` | Usuario de base de datos de phpMyAdmin al ejecutar con Docker. |
| `PMA_PASSWORD` | Contrasena de base de datos de phpMyAdmin al ejecutar con Docker. |

#### Seeder

| Variable | Proposito |
| --- | --- |
| `ADMIN_EMAIL` | Email usado por el script de seed del admin. |
| `ADMIN_PASSWORD` | Contrasena usada por el script de seed del admin. |

Credenciales por defecto del seed admin:
- Email: `admin@template.local`
- Contrasena: `Admin123!`

## Baseline De Pruebas (Jest)

Esta plantilla incluye un punto medio entre "sin pruebas" y "probar todo":

- Integracion HTTP para contratos criticos de API (health, auth, permisos y errores).
- Unitarias para servicios puros y casos de uso (hash, tokens, registro y refresh).
- Sin dependencia de MySQL real en pruebas de integracion: se mockea el repositorio para mantener estabilidad y velocidad.

Comandos:

- `npm test`: ejecuta toda la suite una vez.
- `npm run test:watch`: ejecuta en modo watch para desarrollo.
- `npm run test:coverage`: genera cobertura para revisar huecos.

Cobertura objetivo inicial sugerida para proyectos creados desde esta plantilla:

- 45% a 55% global como red de seguridad inicial.
- Priorizar endpoints de auth, middlewares de seguridad y contratos de error.

Checklist para extender pruebas en proyectos derivados:

1. Agregar al menos una prueba de flujo feliz y una de fallo por endpoint nuevo.
2. Verificar siempre codigos HTTP y `code` de error del contrato publico.
3. Evitar mocks de detalles internos cuando el comportamiento HTTP sea verificable.
4. Mantener pruebas deterministas: sin red externa y sin dependencias no controladas.
5. Ejecutar `npm test` en CI junto con lint antes de mergear cambios.

### Mapa De Documentacion

- `README.md`: onboarding rapido, flujo de desarrollo y variables de entorno requeridas.
- `docs/INSTALLATION.md`: instalacion detallada y ejecucion de comandos para Docker y modo local.
- `docs/ARCHITECTURE.md`: arquitectura por capas, regla de dependencias y estrategia de diseno tecnico.
- `docs/FILES_REFERENCE.md`: guia archivo por archivo con proposito, expectativas de actualizacion y checklist de documentacion.
- `docs/LOGGER.md`: guia practica para usar el logger del proyecto, ejemplos de implementacion y trazabilidad con correlation id.
- `docs/PROJECT_CUSTOMIZATION.md`: guia rapida de renombre para proyecto, contenedores y red de Docker.
- `docs/REQUEST_FLOWS.md`: pipeline de requests y comportamiento de endpoints por grupo de rutas.
- `docs/TROUBLESHOOTING.md`: errores comunes de setup/ejecucion y sus soluciones.

## Mantenimiento De Documentacion

Usa este checklist cuando los cambios de codigo afecten comportamiento, contratos u operacion:

1. Actualiza `docs/FILES_REFERENCE.md` si cambio el proposito o la responsabilidad de un archivo.
2. Actualiza `docs/REQUEST_FLOWS.md` si cambio la cadena de middlewares, validacion, auth o contrato de respuesta.
3. Actualiza `docs/INSTALLATION.md` o `docs/TROUBLESHOOTING.md` si cambiaron comandos de setup/ejecucion o modos de fallo.
4. Actualiza `docs/ARCHITECTURE.md` si cambiaron responsabilidades por capa o direccion de dependencias.
5. Verifica que `README.md` siga enlazando todos los archivos de documentacion vigentes.

Definicion de terminado para actualizaciones de documentacion:

- El proposito de los archivos modificados sigue siendo correcto.
- Se reflejan entradas/salidas y comportamiento de error.
- Se documenta comportamiento sensible de seguridad (auth, secretos, logging).
- Cualquier incidencia recurrente nueva tiene entrada en resolucion de problemas.
