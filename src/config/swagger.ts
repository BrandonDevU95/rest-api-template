import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './environment';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Backend Boilerplate',
      version: '1.0.0',
      description: 'Clean Architecture API boilerplate with Passport Local + JWT',
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
