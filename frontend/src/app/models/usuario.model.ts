export interface Usuario {
  id: string;
  usuarioRed: string;
  nombreCompleto: string;
  email: string;
  area?: string;
  rol: UserRole;
  activo: boolean;
  createdAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  usuarioRed: string;
  nombreCompleto: string;
  email: string;
  password: string;
  area?: string;
}

export interface AuthResponse {
  user: Usuario;
  token: string;
}