# Resolucion De Problemas

Problemas comunes de setup y runtime para este proyecto.

## 1) `getaddrinfo ENOTFOUND mysql`

### Sintoma
Los comandos de base de datos fallan desde la consola host con un error al resolver `mysql`.

### Causa
`.env` usa `DB_HOST=mysql`, que solo se resuelve dentro de la red Docker.

### Solucion
Ejecuta comandos de base de datos dentro del contenedor API:

- `docker compose exec api npm run db:migrate`
- `docker compose exec api npm run db:seed`

Si ejecutas fuera de Docker, usa `DB_HOST=localhost` y asegurate de que MySQL local este activo.

## 2) `docker compose up --build` falla

### Sintoma
Compose termina con codigo 1 durante build o arranque.

### Checklist
1. Confirma que Docker engine este corriendo.
2. Confirma que `.env` existe y que todas las variables requeridas estan definidas.
3. Verifica que los puertos requeridos esten libres (`3000`, `3306`, `8081` por defecto).
4. Reintenta con logs: `docker compose up --build` e inspecciona el primer servicio que falla.
5. Si el cache de imagen esta obsoleto, reconstruye sin cache: `docker compose build --no-cache` y luego `docker compose up`.

## 3) La API inicia pero fallan las migraciones

### Sintoma
El contenedor API esta arriba, pero falla el comando de migracion.

### Causa
La base de datos aun no esta saludable, las credenciales son incorrectas o el host es incorrecto.

### Solucion
1. Verifica la salud del contenedor de base de datos en `docker compose ps`.
2. Verifica valores de entorno DB en `.env`.
3. Ejecuta migracion desde el contenedor:
   - `docker compose exec api npm run db:migrate`

## 4) El login siempre retorna 401

### Sintoma
`POST /auth/login` retorna unauthorized incluso con credenciales esperadas.

### Causas
- El usuario no existe.
- El hash de contrasena no coincide.
- El seeder no se ejecuto.

### Solucion
1. Ejecuta nuevamente el comando de seed si hace falta.
2. Verifica `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env`.
3. Revisa el registro en la tabla `users`.

## 5) Requests bloqueados por CORS

### Sintoma
Las solicitudes desde el navegador fallan con error CORS.

### Causa
El origen no esta permitido por la configuracion `CORS_ORIGIN`.

### Solucion
Agrega el origen de tu frontend a `CORS_ORIGIN` en `.env` y reinicia la API.

## 6) Too many requests (429)

### Sintoma
Las respuestas retornan 429 para llamadas repetidas.

### Causa
La configuracion de rate limit esta activa de forma global y en la ruta de login.

### Solucion
Ajusta variables de entorno de rate limit para tu entorno:
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_LOGIN_MAX_REQUESTS`

## 7) Swagger no disponible

### Sintoma
`/api-docs` retorna 404.

### Causas
- Prefijo de API incorrecto en env.
- Setup de Swagger no montado por un fallo de arranque.

### Solucion
1. Confirma que la API corre sin errores de arranque.
2. Confirma que la URL esperada combina prefijo y ruta de docs.
3. Revisa logs de arranque para errores de inicializacion de Swagger.

## 8) Logs sin correlation id

### Sintoma
Es dificil trazar una request entre logs.

### Causa
El cliente no envio `x-correlation-id`, o el orden de middlewares cambio.

### Solucion
1. Mantener `requestContextMiddleware` antes del middleware de request logging.
2. Opcionalmente, enviar `x-correlation-id` desde clientes.

## 9) Quiero reiniciar todo desde cero

### Sintoma
Necesitas eliminar contenedores y tambien borrar los datos persistidos (por ejemplo la base de datos MySQL).

### Causa
`docker compose down` por si solo no elimina volumenes nombrados.

### Solucion
1. Bajar contenedores y eliminar volumenes del proyecto:
   - `docker compose down -v`
2. Si quieres incluir tambien contenedores huerfanos:
   - `docker compose down -v --remove-orphans`
3. Levantar nuevamente desde cero:
   - `docker compose up --build`
4. Volver a aplicar estructura de datos inicial:
   - `docker compose exec api npm run db:migrate`
   - `docker compose exec api npm run db:seed`

### Advertencia
La bandera `-v` elimina volumenes nombrados del compose, por lo tanto se pierde toda la data persistida.
