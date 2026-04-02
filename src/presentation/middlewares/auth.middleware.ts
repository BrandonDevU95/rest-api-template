import { NextFunction, Request, Response } from 'express';
import { passport } from '../../infrastructure/auth/passport';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/AppError';
import { getCurrentUser } from './currentUser.middleware';

/**
 * Middlewares de autenticacion/autorizacion usados por rutas protegidas.
 *
 * - authenticateJwt: valida bearer token y popula req.user.
 * - authorizeRoles: permite solo roles explicitos.
 * - authorizeAdminOrSelf: permite admins o propietario del recurso :id.
 */
export const authenticateJwt = passport.authenticate('jwt', { session: false });

export const authorizeRoles = (...roles: Array<'admin' | 'user'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = getCurrentUser(req).role;
    if (!role) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(role as 'admin' | 'user')) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

export const authorizeAdminOrSelf = (req: Request, _res: Response, next: NextFunction): void => {
  const currentUser = getCurrentUser(req);
  const targetUserId = String(req.params.id);

  if (currentUser.role === 'admin' || currentUser.id === targetUserId) {
    next();
    return;
  }

  throw new ForbiddenError('Insufficient permissions');
};
