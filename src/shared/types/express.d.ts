import type { JwtPayload } from '../../application/dto/auth.dto';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      user?: JwtPayload;
    }
  }
}

export {};
