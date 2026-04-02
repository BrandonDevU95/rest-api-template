import { env } from './environment';
import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Especificacion OpenAPI generada desde anotaciones de rutas.
 *
 * La documentacion se limita a rutas de presentation y usa el prefijo API actual
 * para que el Swagger UI publicado coincida con el enrutamiento en runtime.
 */
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: env.app.name,
      version: '1.0.0',
      description: env.app.description,
    },
    servers: [
      {
        url: `http://localhost:${env.app.port}${env.app.apiPrefix}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['src/presentation/routes/*.ts'],
});
