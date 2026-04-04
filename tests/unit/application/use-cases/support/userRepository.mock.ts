import { jest } from '@jest/globals';
import { User } from '../../../../../src/domain/entities/User';
import {
  CreateUserInput,
  UpdateUserInput,
} from '../../../../../src/domain/interfaces/IUserRepository';

export type MockUserRepository = {
  findById: jest.Mock<(id: string) => Promise<User | null>>;
  findByEmail: jest.Mock<(email: string) => Promise<User | null>>;
  create: jest.Mock<(input: CreateUserInput) => Promise<User>>;
  updateById: jest.Mock<(id: string, input: UpdateUserInput) => Promise<User | null>>;
  list: jest.Mock<() => Promise<User[]>>;
  deleteById: jest.Mock<(id: string) => Promise<boolean>>;
};

export const createMockUserRepository = (): MockUserRepository => ({
  findById: jest.fn<(id: string) => Promise<User | null>>(),
  findByEmail: jest.fn<(email: string) => Promise<User | null>>(),
  create: jest.fn<(input: CreateUserInput) => Promise<User>>(),
  updateById: jest.fn<(id: string, input: UpdateUserInput) => Promise<User | null>>(),
  list: jest.fn<() => Promise<User[]>>(),
  deleteById: jest.fn<(id: string) => Promise<boolean>>(),
});
