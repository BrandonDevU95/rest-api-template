import { Request } from 'express';
import { UnauthorizedError } from '../../shared/errors/AppError';

/**
 * Extracts authenticated identity from req.user.
 *
 * Assumes authentication middleware already populated req.user.
 * Throws UnauthorizedError when request is unauthenticated.
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
