import {
  CreateUserInput,
  IUserRepository,
  UpdateUserInput,
} from '../../../domain/interfaces/IUserRepository';
import { UniqueConstraintError } from 'sequelize';
import { ConflictError } from '../../../shared/errors/AppError';
import { AuthUser, User } from '../../../domain/entities/User';
import { UserModel } from '../models/UserModel';

/**
 * Implementacion de IUserRepository respaldada por Sequelize.
 *
 * Regla de mapeo:
 * - El modelo de persistencia (UserModel) se traduce a entidades de dominio
 *   segun el contexto (User o AuthUser).
 *
 * Semantica de null:
 * - findById/findByEmail/updateById retornan null cuando el objetivo no existe.
 */
export class UserRepository implements IUserRepository {
  private mapToDomain(model: UserModel): User {
    return new User({
      id: model.id,
      email: model.email,
      role: model.role,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  private mapToAuthDomain(model: UserModel): AuthUser {
    return new AuthUser({
      id: model.id,
      email: model.email,
      passwordHash: model.getDataValue('passwordHash'),
      role: model.role,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
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
    const user = await UserModel.findOne({ where: { email: this.normalizeEmail(email) } });
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmailForAuth(email: string): Promise<AuthUser | null> {
    const user = await UserModel.unscoped().findOne({ where: { email: this.normalizeEmail(email) } });
    return user ? this.mapToAuthDomain(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      const user = await UserModel.create({
        ...input,
        email: this.normalizeEmail(input.email),
      });
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

    const normalizedInput: UpdateUserInput = {
      ...input,
      email: input.email ? this.normalizeEmail(input.email) : undefined,
    };

    try {
      await user.update(normalizedInput);
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
