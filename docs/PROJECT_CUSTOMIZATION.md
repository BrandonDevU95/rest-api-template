# Guia Breve De Naming Del Proyecto

Usa esta guia para renombrar la plantilla en pocos minutos sin buscar por todo el codigo.

## Que Editar

1. `.env`

## Checklist De Renombre

1. Abre `.env` y cambia estos valores:
   - `PROJECT_SLUG`
2. Actualiza los valores por defecto de base de datos y seed en `.env` si quieres que los datos de ejemplo coincidan con el nuevo nombre del proyecto.
3. Ejecuta `npm run naming:sync` para actualizar `package.json` y `package-lock.json` desde `PROJECT_SLUG`.
4. Ejecuta `docker compose up --build`.
5. Si cambiaste `.env`, reinicia contenedores para que Docker tome los nuevos nombres.

## Que Afecta Cada Nombre

| Valor                     | Afecta                                                                                                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROJECT_SLUG`            | Nombre del proyecto Docker Compose, nombres de contenedores API/MySQL/phpMyAdmin, nombre de red compartida, nombre de app (logs/titulo Swagger), descripcion de Swagger, nombre del paquete y descripcion del paquete |
| `ALLOW_NON_STANDARD_TLDS` | Controla si Joi acepta correos con dominios internos como `.local`. Cuando vale `true`, el proyecto acepta el seed admin y los correos de pruebas locales.                                                            |

## Resultado

Despues de estos cambios, la identidad del proyecto se actualiza en un solo lugar en vez de quedar dispersa en varias carpetas.

## Validacion De Emails

Si necesitas que el proyecto acepte correos internos o locales como `admin@template.local`, deja `ALLOW_NON_STANDARD_TLDS=true` en `.env`.

Si quieres volver al comportamiento estricto de Joi con TLD publicos, cambia la variable a `false` y reinicia la aplicacion.
