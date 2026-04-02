import {
  CreateUserInput,
  IUserRepository,
  UpdateUserInput,
} from '../../../domain/interfaces/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserModel } from '../models/UserModel';

/**
 * Sequelize-backed implementation of IUserRepository.
 *
 * Mapping rule:
 * - Persistence model (UserModel) is translated to Domain entity (User)
 *   before returning data to upper layers.
 *
 * Null semantics:
 * - findById/findByEmail/updateById return null when the target does not exist.
 */
export class UserRepository implements IUserRepository {
  private mapToDomain(model: UserModel): User {
    return new User({
      id: model.id,
      email: model.email,
      passwordHash: model.passwordHash,
      role: model.role,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ where: { email } });
    return user ? this.mapToDomain(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await UserModel.create(input);
    return this.mapToDomain(user);
  }

  async updateById(id: string, input: UpdateUserInput): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    if (!user) {
      return null;
    }

    await user.update(input);
    return this.mapToDomain(user);
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
