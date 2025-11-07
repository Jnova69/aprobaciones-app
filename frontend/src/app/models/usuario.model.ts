export interface Usuario {
  id: string;
  usuarioRed: string;
  nombreCompleto: string;
  email: string;
  area?: string;
  activo: boolean;
  createdAt: Date;
}