import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { usersRouter } from './users.routes';

/**
 * Raiz de composicion del router API.
 *
 * Monta todos los routers funcionales bajo el prefijo API de la aplicacion.
 */
export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
