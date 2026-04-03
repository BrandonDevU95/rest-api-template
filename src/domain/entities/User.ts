export type UserRole = 'admin' | 'user';

export interface UserProps {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserProps extends UserProps {
  passwordHash: string;
}

/**
 * Entidad de usuario de dominio para flujos no sensibles.
 */
export class User {
  public readonly id: string;
  public email: string;
  public role: UserRole;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  hasRole(role: UserRole): boolean {
    return this.role === role;
  }
}

/**
 * Entidad de usuario para autenticacion.
 *
 * Expone passwordHash solo dentro del limite de confianza auth.
 */
export class AuthUser extends User {
  public readonly passwordHash: string;

  constructor(props: AuthUserProps) {
    super(props);
    this.passwordHash = props.passwordHash;
  }
}
