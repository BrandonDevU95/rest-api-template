import { Router } from 'express';

/**
 * Ruta publica de health-check usada por monitores y probes de orquestacion.
 */
export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

