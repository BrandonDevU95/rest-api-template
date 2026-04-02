/**
 * Express type augmentation for authenticated user identity and request
 * correlation id propagated by middlewares.
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
