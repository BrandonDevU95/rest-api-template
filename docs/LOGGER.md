# Guia Del Logger

Esta guia explica como usar el logger del proyecto para registrar eventos de aplicacion, depurar durante el desarrollo y mantener trazabilidad entre requests y errores.

## Que Problema Resuelve

El logger centraliza cuatro necesidades:

1. Registrar eventos de negocio y de infraestructura con un formato consistente.
2. Guardar logs en archivos rotativos para diagnostico posterior.
3. Mostrar informacion legible por consola en desarrollo.
4. Proteger datos sensibles y conservar trazabilidad con `correlationId`.

## Piezas Que Lo Integran

El logger vive en `src/infrastructure/logger/` y se compone de:

- `logger.ts`: instancia principal de Winston y configuracion de transports.
- `levels.ts`: niveles soportados por el proyecto.
- `formats.ts`: formato JSON, formato de consola y redaccion de datos sensibles.
- `morgan.middleware.ts`: logging de requests HTTP.
- `requestContext.middleware.ts`: generacion y propagacion de `correlationId`.

## Niveles Disponibles

El proyecto usa estos niveles:

| Nivel   | Uso recomendado                                       |
| ------- | ----------------------------------------------------- |
| `error` | Fallos que afectan una operacion o un flujo completo. |
| `warn`  | Situaciones anormales que no bloquean la ejecucion.   |
| `info`  | Eventos relevantes de negocio o arranque.             |
| `http`  | Requests HTTP capturados por Morgan.                  |
| `debug` | Detalle tecnico para desarrollo y diagnostico.        |

El nivel minimo se controla con `LOG_LEVEL`.

## Salida Del Logger

### En Desarrollo

Cuando `NODE_ENV=development`, el logger agrega salida por consola con color y un formato facil de leer.

### En Archivos

Siempre escribe logs estructurados en archivos rotativos dentro del directorio configurado por `LOG_DIR`:

- `application-YYYY-MM-DD.log`: logs generales.
- `error-YYYY-MM-DD.log`: solo errores.
- `exceptions.log`: excepciones no controladas.
- `rejections.log`: promesas rechazadas no manejadas.

La rotacion usa retencion por tiempo y tamano para evitar crecimiento ilimitado.

## Redaccion De Datos Sensibles

Antes de persistir logs, `redactFormat` reemplaza valores sensibles por `[REDACTED]`.

Claves redactadas por defecto:

- `password`
- `passwordHash`
- `token`
- `accessToken`
- `refreshToken`
- `authorization`
- `cookie`
- `set-cookie`
- `secret`
- `apiKey` / `api-key` / `x-api-key`
- `creditCard`

Tambien se sanitizan patrones de texto que parezcan JWT o cabeceras `Bearer ...` aunque no esten en una clave sensible.

Si agregas metadatos propios, evita escribir secretos en texto plano. La redaccion ayuda, pero no sustituye un buen uso del logger.

## Trazabilidad Con Correlation ID

El middleware `requestContext` genera o reusa un `x-correlation-id` y lo expone en `req.correlationId`.

Ese valor se usa en dos lugares:

- En logs HTTP generados por `httpLogger`.
- En errores registrados por `errorHandler`.

Asi puedes seguir una misma request desde el acceso HTTP hasta la excepcion final.

## Como Usarlo En El Codigo

Importa el logger directamente en la capa donde necesites registrar informacion:

```ts
import { logger } from '../infrastructure/logger/logger';
```

### 1. Registrar Eventos De Arranque

`src/main.ts` usa el logger para confirmar que el bootstrap termino bien:

```ts
logger.info(`${env.app.name} running on port ${env.app.port} (${env.nodeEnv})`);
```

Y si el arranque falla:

```ts
logger.error('Failed to bootstrap application', { meta: { error } });
```

### 2. Registrar Errores HTTP

`src/presentation/middlewares/errorHandler.ts` registra el error con contexto util para diagnostico:

```ts
logger.error(appError.message, {
  correlationId: req.correlationId,
  meta: {
    code: appError.code,
    statusCode: appError.statusCode,
    stack: env.isProduction ? undefined : appError.stack,
    originalError: env.isProduction ? undefined : originalError,
    path: req.originalUrl,
    method: req.method,
  },
});
```

### 3. Registrar Requests HTTP

`httpLogger` adapta Morgan para que cada request termine en Winston:

```ts
const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
```

El formato incluye metodo, ruta, estado, tamanio, tiempo de respuesta y correlation id.

### 4. Registrar Eventos De Negocio O Infraestructura

Usa `info`, `warn` o `debug` segun el nivel de detalle que necesites:

```ts
logger.info('User created', {
  meta: {
    userId,
    email,
    role,
  },
});

logger.warn('Login attempt failed', {
  meta: {
    email,
    reason: 'invalid_credentials',
  },
});

logger.debug('Token payload generated', {
  meta: {
    subject,
    expiresIn,
  },
});
```

## Recomendaciones De Uso

- Usa `info` para hitos de negocio, no para ruido de cada funcion.
- Usa `warn` cuando algo sea inesperado pero recuperable.
- Usa `error` para fallos que deben investigarse.
- Usa `debug` solo para diagnostico tecnico detallado.
- Incluye `meta` con contexto util: ids, ruta, metodo, rol, estado y motivo.
- No escribas contrasenas, tokens, cookies ni cabeceras sensibles.
- Reusa `req.correlationId` cuando registres desde middlewares o controladores HTTP.
- No conviertas el logger en una segunda respuesta HTTP; solo registra, no resuelvas el flujo desde ahi.

## Que No Loggear (Anti-Patrones)

Evita estos patrones porque generan riesgo de seguridad o ruido operativo:

- No loggear payloads completos de `req.body` en auth o usuarios.
- No loggear contrasenas, hashes, tokens JWT, cookies ni cabeceras `Authorization`.
- No loggear objetos de error sin control en produccion si incluyen datos sensibles.
- No usar `error` para eventos esperados de validacion o conflicto; usa `warn`.
- No duplicar el mismo evento en muchas capas (controller + use case + repository) salvo que tengas un objetivo de auditoria claro.

En este proyecto, para evitar fuga de datos:

- Los logs usan `meta` con campos puntuales en vez de objetos completos.
- El formato `redactFormat` aplica redaccion de claves sensibles antes de persistir.

## Ejemplos De Implementacion En Este Proyecto

Los puntos de uso actuales son:

- `src/main.ts`: registra arranque exitoso y fallos fatales del bootstrap.
- `src/presentation/controllers/AuthController.ts`: registra login exitoso y rechazos de credenciales con `correlationId`.
- `src/presentation/controllers/AuthController.ts`: registra logout exitoso con `correlationId`.
- `src/application/use-cases/auth/RegisterUseCase.ts`: registra conflictos de email y alta de usuario con metadatos de negocio no sensibles.
- `src/presentation/controllers/UserController.ts`: registra acciones CRUD de usuarios con actor, objetivo y contexto HTTP.
- `src/presentation/middlewares/errorHandler.ts`: registra errores de negocio y tecnicos con contexto HTTP.
- `src/infrastructure/logger/morgan.middleware.ts`: registra cada request HTTP.
- `src/infrastructure/maintenance/tokenBlacklistCleanup.job.ts`: registra resultados de limpieza de revocaciones expiradas y errores del job.

Esos lugares muestran el patron recomendado para el resto del proyecto.

## Variables De Entorno Relacionadas

- `LOG_LEVEL`: nivel minimo que el logger va a emitir.
- `LOG_DIR`: carpeta donde se guardan los archivos de log.
- `NODE_ENV`: define si se agrega salida legible por consola en desarrollo.

## Como Verificar Que Funciona

1. Levanta la API.
2. Haz una request a cualquier endpoint.
3. Revisa la consola si estas en desarrollo.
4. Revisa los archivos generados dentro de `LOG_DIR`.
5. Provoca un error controlado y confirma que aparece en `error-YYYY-MM-DD.log` con su `correlationId`.

## Regla Practica Para Nuevos Logs

Si necesitas registrar algo nuevo, piensa primero en esto:

1. `info` si describe un evento importante.
2. `warn` si es una situacion anomala recuperable.
3. `error` si hay una falla real.
4. `debug` si solo ayuda a diagnosticar en desarrollo.

Si el mensaje puede contener informacion sensible, pasa el dato por `meta` y evita serializar objetos completos sin revisar su contenido.
