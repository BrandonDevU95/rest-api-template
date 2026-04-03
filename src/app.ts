import './infrastructure/auth/passport';

import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler';
import {
  apiRateLimiter,
  corsMiddleware,
  helmetMiddleware,
} from './presentation/middlewares/security.middleware';

import express from 'express';
import passport from 'passport';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/environment';
import { swaggerSpec } from './config/swagger';
import { httpLogger } from './infrastructure/logger/morgan.middleware';
import { requestContext } from './infrastructure/logger/requestContext.middleware';
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
app.set('trust proxy', env.security.trustProxyHops);
app.use(requestContext);
app.use(httpLogger);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(apiRateLimiter);

if (env.docs.enablePublicDocs) {
  const projectRoot = process.cwd();
  const docsViewerDir = path.join(projectRoot, 'docs', 'viewer');
  const docsMarkdownDir = path.join(projectRoot, 'docs');
  const readmePath = path.join(projectRoot, 'README.md');

  app.use('/documentation', express.static(docsViewerDir));
  app.use('/documentation/files/docs', express.static(docsMarkdownDir));
  app.get('/documentation/files/README.md', (_req, res) => {
    res.sendFile(readmePath);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customJs: '/documentation/swagger-topbar.js',
      customCssUrl: '/documentation/swagger-topbar.css',
    }),
  );
}

app.use(env.app.apiPrefix, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

