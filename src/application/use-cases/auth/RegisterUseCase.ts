import { RegisterDto, TokenPairDto } from '../../dto/auth.dto';

import { ConflictError } from '../../../shared/errors/AppError';
import { HashService } from '../../services/HashService';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { TokenService } from '../../services/TokenService';
import { logger } from '../../../infrastructure/logger/logger';

/**
 * Orquestacion del flujo de registro.
 *
 * Secuencia:
 * 1) rechazar si el email ya existe
 * 2) hashear la contrasena en texto plano
 * 3) persistir usuario con rol por defecto "user"
 * 4) retornar access/refresh tokens firmados
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<TokenPairDto> {
    const emailDomain = dto.email.includes('@') ? dto.email.split('@')[1] : 'unknown';
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      logger.warn('Register rejected: email already exists', {
        meta: {
          emailDomain,
        },
      });
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

    return this.tokenService.createTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
