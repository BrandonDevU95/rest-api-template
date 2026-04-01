import { Request, Response } from 'express';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { HashService } from '../../application/services/HashService';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { getCurrentUser } from '../middlewares/currentUser.middleware';

const userRepository = new UserRepository();
const hashService = new HashService();

export class UserController {
  static async create(req: Request, res: Response): Promise<void> {
    const existing = await userRepository.findByEmail(req.body.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    const passwordHash = await hashService.hash(req.body.password);
    const user = await userRepository.create({
      email: req.body.email,
      passwordHash,
      role: req.body.role ?? 'user',
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  }

  static async list(_req: Request, res: Response): Promise<void> {
    const users = await userRepository.list();
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
    const id = String(req.params.id);
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

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
        throw new ConflictError('Email already exists');
      }
    }

    const user = await userRepository.updateById(id, {
      email: req.body.email,
      role: req.body.role,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt,
    });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const deleted = await userRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError('User not found');
    }

    res.status(204).send();
  }
}
