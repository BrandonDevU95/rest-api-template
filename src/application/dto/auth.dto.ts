export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  role: 'admin' | 'user';
  email: string;
}

export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
}
