import { Usuario } from './usuario.model';
import { TipoSolicitud } from './tipo-solicitud.model';

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export interface Solicitud {
  id: string;
  codigoSolicitud: string;
  titulo: string;
  descripcion: string;
  tipoSolicitudId: string;
  solicitanteId: string;
  responsableId: string;
  estado: EstadoSolicitud;
  fechaSolicitud: Date;
  fechaRespuesta?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  tipoSolicitud?: TipoSolicitud;
  solicitante?: Usuario;
  responsable?: Usuario;
  comentarios?: Comentario[];
}

export interface Comentario {
  id: string;
  solicitudId: string;
  usuarioId: string;
  comentario: string;
  createdAt: Date;
  usuario?: Usuario;
}

export interface HistorialSolicitud {
  id: string;
  solicitudId: string;
  usuarioId: string;
  accion: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  comentario?: string;
  fechaAccion: Date;
  usuario?: Usuario;
}