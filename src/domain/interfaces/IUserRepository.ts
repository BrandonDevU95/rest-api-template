import { User } from '../entities/User';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  list(): Promise<User[]>;
  deleteById(id: string): Promise<boolean>;
}
