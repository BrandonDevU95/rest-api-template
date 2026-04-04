import { RegisterDto } from '../../dto/auth.dto';

import { HashService } from '../../services/HashService';
import { ConflictError } from '../../../shared/errors/AppError';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { logger } from '../../../infrastructure/logger/logger';
import { User } from '../../../domain/entities/User';

/**
 * Orquestacion del flujo de registro.
 *
 * Si el usuario ya existe, se rechaza la solicitud con conflicto para mantener
 * consistencia con la creacion administrada de usuarios.
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const emailDomain = dto.email.includes('@') ? dto.email.split('@')[1] : 'unknown';
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictError('Email already exists');
    }

    const passwordHash = await this.hashService.hash(dto.password);

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

    return user;
  }
}
