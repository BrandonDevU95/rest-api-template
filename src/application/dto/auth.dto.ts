export interface RegisterDto {
  /** Correo en texto plano usado durante el registro. */
  email: string;
  /** Contrasena en texto plano usada solo en los limites de autenticacion. */
  password: string;
}

export interface LoginDto {
  /** Correo en texto plano usado durante el inicio de sesion. */
  email: string;
  /** Contrasena en texto plano usada solo en los limites de autenticacion. */
  password: string;
}

export interface JwtPayload {
  /** Identificador de usuario almacenado en el claim estandar subject de JWT. */
  sub: string;
  /** Rol usado por las validaciones de autorizacion. */
  role: 'admin' | 'user';
  /** Claim de conveniencia para identidad de usuario sin consulta a DB. */
  email: string;
}

export interface TokenPairDto {
  /** Access token de corta duracion. */
  accessToken: string;
  /** Refresh token de mayor duracion. */
  refreshToken: string;
}
