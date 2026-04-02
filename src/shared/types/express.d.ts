/**
 * Ampliacion de tipos de Express para identidad de usuario autenticado y
 * correlation id propagado por middlewares.
 */
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: 'admin' | 'user';
    }

    interface Request {
      correlationId?: string;
    }
  }
}

export {};
