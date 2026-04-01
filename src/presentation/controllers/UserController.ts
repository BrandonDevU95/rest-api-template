import { Request, Response } from 'express';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { NotFoundError } from '../../shared/errors/AppError';

const userRepository = new UserRepository();

export class UserController {
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

  static async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const deleted = await userRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError('User not found');
    }

    res.status(204).send();
  }
}
