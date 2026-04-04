import { RegisterDto } from '../../dto/auth.dto';

import { HashService } from '../../services/HashService';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { logger } from '../../../infrastructure/logger/logger';

/**
 * Orquestacion del flujo de registro.
 *
 * El registro es ciego hacia el cliente para evitar enumeracion de cuentas.
 * Si el usuario ya existe, se procesa la solicitud de la misma forma a nivel
 * publico, pero no se crea un duplicado.
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: RegisterDto): Promise<void> {
    const emailDomain = dto.email.includes('@') ? dto.email.split('@')[1] : 'unknown';
    const passwordHash = await this.hashService.hash(dto.password);
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      logger.warn('Register request processed for existing email', {
        meta: {
          emailDomain,
        },
      });
      return;
    }

    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      role: 'user',
    });

    logger.info('User registered', {
      meta: {
        userId: user.id,
        role: user.role,
        emailDomain,
      },
    });
  }
}
