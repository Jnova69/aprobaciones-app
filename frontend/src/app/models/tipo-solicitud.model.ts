export interface TipoSolicitud {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: Date;
}