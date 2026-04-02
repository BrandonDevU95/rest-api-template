import { ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { Request, Response } from 'express';

import { HashService } from '../../application/services/HashService';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { getCurrentUser } from '../middlewares/currentUser.middleware';
import { logger } from '../../infrastructure/logger/logger';

const userRepository = new UserRepository();
const hashService = new HashService();

/**
 * Controlador HTTP para endpoints CRUD de usuarios.
 *
 * Los middlewares a nivel de ruta aplican autenticacion y RBAC de grano grueso.
 * Este controlador aplica validaciones a nivel de datos como unicidad de email y
 * restricciones de escalamiento de rol para usuarios no admin.
 */
export class UserController {
  static async create(req: Request, res: Response): Promise<void> {
    const currentUser = getCurrentUser(req);
    const existing = await userRepository.findByEmail(req.body.email);
    if (existing) {
      logger.warn('User creation rejected: email already exists', {
        correlationId: req.correlationId,
        meta: {
          actorUserId: currentUser.id,
          actorRole: currentUser.role,
          path: req.originalUrl,
          method: req.method,
        },
      });
      throw new ConflictError('Email already exists');
    }

    const passwordHash = await hashService.hash(req.body.password);
    const user = await userRepository.create({
      email: req.body.email,
      passwordHash,
      role: req.body.role ?? 'user',
    });

    logger.info('User created', {
      correlationId: req.correlationId,
      meta: {
        actorUserId: currentUser.id,
        actorRole: currentUser.role,
        createdUserId: user.id,
        createdUserRole: user.role,
        path: req.originalUrl,
        method: req.method,
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  }

  static async list(req: Request, res: Response): Promise<void> {
    const currentUser = getCurrentUser(req);
    const users = await userRepository.list();

    logger.info('Users listed', {
      correlationId: req.correlationId,
      meta: {
        actorUserId: currentUser.id,
        actorRole: currentUser.role,
        totalUsers: users.length,
        path: req.originalUrl,
        method: req.method,
      },
    });

    res.status(200).json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const currentUser = getCurrentUser(req);
    const id = String(req.params.id);
    const user = await userRepository.findById(id);

    if (!user) {
      logger.warn('User lookup failed: user not found', {
        correlationId: req.correlationId,
        meta: {
          actorUserId: currentUser.id,
          actorRole: currentUser.role,
          targetUserId: id,
          path: req.originalUrl,
          method: req.method,
        },
      });
      throw new NotFoundError('User not found');
    }

    logger.info('User fetched by id', {
      correlationId: req.correlationId,
      meta: {
        actorUserId: currentUser.id,
        actorRole: currentUser.role,
        targetUserId: id,
        path: req.originalUrl,
        method: req.method,
      },
    });

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const currentUser = getCurrentUser(req);

    if (req.body.role && currentUser.role !== 'admin') {
      req.body.role = undefined;
    }

    if (req.body.email) {
      const existing = await userRepository.findByEmail(req.body.email);
      if (existing && existing.id !== id) {
        logger.warn('User update rejected: email already exists', {
          correlationId: req.correlationId,
          meta: {
            actorUserId: currentUser.id,
            actorRole: currentUser.role,
            targetUserId: id,
            path: req.originalUrl,
            method: req.method,
          },
        });
        throw new ConflictError('Email already exists');
      }
    }

    const user = await userRepository.updateById(id, {
      email: req.body.email,
      role: req.body.role,
    });

    if (!user) {
      logger.warn('User update failed: user not found', {
        correlationId: req.correlationId,
        meta: {
          actorUserId: currentUser.id,
          actorRole: currentUser.role,
          targetUserId: id,
          path: req.originalUrl,
          method: req.method,
        },
      });
      throw new NotFoundError('User not found');
    }

    logger.info('User updated', {
      correlationId: req.correlationId,
      meta: {
        actorUserId: currentUser.id,
        actorRole: currentUser.role,
        targetUserId: id,
        updatedRole: user.role,
        path: req.originalUrl,
        method: req.method,
      },
    });

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt,
    });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const currentUser = getCurrentUser(req);
    const deleted = await userRepository.deleteById(id);
    if (!deleted) {
      logger.warn('User deletion failed: user not found', {
        correlationId: req.correlationId,
        meta: {
          actorUserId: currentUser.id,
          actorRole: currentUser.role,
          targetUserId: id,
          path: req.originalUrl,
          method: req.method,
        },
      });
      throw new NotFoundError('User not found');
    }

    logger.info('User deleted', {
      correlationId: req.correlationId,
      meta: {
        actorUserId: currentUser.id,
        actorRole: currentUser.role,
        targetUserId: id,
        path: req.originalUrl,
        method: req.method,
      },
    });

    res.status(204).send();
  }
}
