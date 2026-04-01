import { NextFunction, Request, Response } from 'express';
import { passport } from '../../infrastructure/auth/passport';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/AppError';

export const authenticateJwt = passport.authenticate('jwt', { session: false });

export const authorizeRoles = (...roles: Array<'admin' | 'user'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = (req.user as { role?: string } | undefined)?.role;
    if (!role) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(role as 'admin' | 'user')) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
