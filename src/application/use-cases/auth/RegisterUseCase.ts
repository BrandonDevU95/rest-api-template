import { ConflictError } from '../../../shared/errors/AppError';
import { RegisterDto, TokenPairDto } from '../../dto/auth.dto';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { HashService } from '../../services/HashService';
import { TokenService } from '../../services/TokenService';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<TokenPairDto> {
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

    return this.tokenService.createTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
