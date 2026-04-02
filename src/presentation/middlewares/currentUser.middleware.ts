import { Request } from 'express';
import { UnauthorizedError } from '../../shared/errors/AppError';

/**
 * Extrae la identidad autenticada desde req.user.
 *
 * Asume que el middleware de autenticacion ya poblo req.user.
 * Lanza UnauthorizedError cuando la request no esta autenticada.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export const getCurrentUser = (req: Request): AuthenticatedUser => {
  const user = req.user as AuthenticatedUser | undefined;
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  return user;
};
