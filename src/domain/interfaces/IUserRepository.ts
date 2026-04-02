import { User } from '../entities/User';

/**
 * User repository contract.
 *
 * Infrastructure must implement this interface so application use-cases can
 * remain persistence-agnostic.
 */
export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

export interface UpdateUserInput {
  email?: string;
  role?: 'admin' | 'user';
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  updateById(id: string, input: UpdateUserInput): Promise<User | null>;
  list(): Promise<User[]>;
  deleteById(id: string): Promise<boolean>;
}
