export interface CreateSolicitudDto {
  titulo: string;
  descripcion: string;
  tipoSolicitudId: string;
  solicitanteId: string;
  responsableId: string;
}

export interface AprobarSolicitudDto {
  usuarioId: string;
  comentario?: string;
}

export interface RechazarSolicitudDto {
  usuarioId: string;
  comentario: string;
}