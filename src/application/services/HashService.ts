import bcrypt from 'bcrypt';
import { env } from '../../config/environment';

/**
 * Abstraccion para hash de contrasenas.
 *
 * Centraliza el uso de bcrypt para que la politica de salt rounds se controle desde
 * la configuracion de entorno y la comparacion de contrasenas sea consistente.
 */
export class HashService {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, env.security.bcryptSaltRounds);
  }

  async compare(plainText: string, digest: string): Promise<boolean> {
    return bcrypt.compare(plainText, digest);
  }
}
