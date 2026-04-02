export type UserRole = 'admin' | 'user';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de usuario de dominio.
 *
 * Contiene el estado central del usuario y comportamiento de dominio simple sin framework ni ORM
 * dependencias. Campos sensibles como passwordHash nunca deben exponerse
 * fuera de los limites de confianza de la aplicacion.
 */
export class User {
  public readonly id: string;
  public email: string;
  public passwordHash: string;
  public role: UserRole;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  hasRole(role: UserRole): boolean {
    return this.role === role;
  }
}
