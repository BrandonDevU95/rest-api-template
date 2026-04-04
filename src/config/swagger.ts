import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './environment';

/**
 * Especificacion OpenAPI generada desde anotaciones de rutas.
 *
 * La documentacion se limita a rutas de presentation y usa rutas relativas
 * para evitar exponer hosts/puertos internos en entornos con proxy.
 */
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: env.app.name,
      version: '1.0.0',
      description: `${env.app.description}\n\nCentro de documentacion general: /documentation`,
    },
    externalDocs: {
      description: 'Centro de documentacion (README + docs)',
      url: '/documentation',
    },
    servers: [
      {
        url: env.app.apiPrefix,
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
