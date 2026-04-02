import bcrypt from 'bcrypt';
import { env } from '../../config/environment';

/**
 * Password hashing abstraction.
 *
 * Keeps bcrypt usage centralized so salt-round policy is controlled from
 * environment config and password comparison stays consistent.
 */
export class HashService {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, env.security.bcryptSaltRounds);
  }

  async compare(plainText: string, digest: string): Promise<boolean> {
    return bcrypt.compare(plainText, digest);
  }
}
