export interface RegisterDto {
  /** Plain-text email used during registration. */
  email: string;
  /** Plain-text password used only at auth boundaries. */
  password: string;
}

export interface LoginDto {
  /** Plain-text email used during login. */
  email: string;
  /** Plain-text password used only at auth boundaries. */
  password: string;
}

export interface JwtPayload {
  /** User identifier stored in JWT standard subject claim. */
  sub: string;
  /** Role used by authorization checks. */
  role: 'admin' | 'user';
  /** Convenience claim for user identity without DB lookup. */
  email: string;
}

export interface TokenPairDto {
  /** Short-lived access token. */
  accessToken: string;
  /** Longer-lived refresh token. */
  refreshToken: string;
}
