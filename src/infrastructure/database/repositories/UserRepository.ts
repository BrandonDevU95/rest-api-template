import {
  CreateUserInput,
  IUserRepository,
  UpdateUserInput,
} from '../../../domain/interfaces/IUserRepository';
import { UniqueConstraintError } from 'sequelize';
import { ConflictError } from '../../../shared/errors/AppError';
import { User } from '../../../domain/entities/User';
import { UserModel } from '../models/UserModel';

/**
 * Implementacion de IUserRepository respaldada por Sequelize.
 *
 * Regla de mapeo:
 * - El modelo de persistencia (UserModel) se traduce a la entidad de dominio (User)
 *   antes de devolver datos a capas superiores.
 *
 * Semantica de null:
 * - findById/findByEmail/updateById retornan null cuando el objetivo no existe.
 */
export class UserRepository implements IUserRepository {
  private mapToDomain(model: UserModel): User {
    return new User({
      id: model.id,
      email: model.email,
      passwordHash: model.getDataValue('passwordHash') ?? '',
      role: model.role,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  private mapPersistenceError(error: unknown): never {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError('Email already exists');
    }

    throw error;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ where: { email } });
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    const user = await UserModel.unscoped().findOne({ where: { email } });
    return user ? this.mapToDomain(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      const user = await UserModel.create(input);
      return this.mapToDomain(user);
    } catch (error) {
      this.mapPersistenceError(error);
    }
  }

  async updateById(id: string, input: UpdateUserInput): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    if (!user) {
      return null;
    }

    try {
      await user.update(input);
      return this.mapToDomain(user);
    } catch (error) {
      this.mapPersistenceError(error);
    }
  }

  async list(): Promise<User[]> {
    const users = await UserModel.findAll({ order: [['createdAt', 'DESC']] });
    return users.map((user) => this.mapToDomain(user));
  }

  async deleteById(id: string): Promise<boolean> {
    const deleted = await UserModel.destroy({ where: { id } });
    return deleted > 0;
  }
}
