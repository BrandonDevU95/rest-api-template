import express from 'express';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/environment';
import { httpLogger } from './infrastructure/logger/morgan.middleware';
import { requestContext } from './infrastructure/logger/requestContext.middleware';
import './infrastructure/auth/passport';
import { swaggerSpec } from './config/swagger';
import {
  apiRateLimiter,
  corsMiddleware,
  helmetMiddleware,
} from './presentation/middlewares/security.middleware';
import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler';
import { apiRouter } from './presentation/routes';

export const app = express();

/**
 * Composicion de la aplicacion Express.
 *
 * El orden de middlewares es intencional:
 * - primero contexto de request y logging HTTP
 * - middlewares de seguridad antes del parseo de body y el enrutamiento
 * - Passport antes de rutas protegidas
 * - not-found y handlers de error al final
 */
app.disable('x-powered-by');
app.use(requestContext);
app.use(httpLogger);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(apiRateLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(env.app.apiPrefix, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
