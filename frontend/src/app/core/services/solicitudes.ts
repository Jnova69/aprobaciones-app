import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { 
  Solicitud, 
  EstadoSolicitud, 
  HistorialSolicitud 
} from '../../models/solicitud.model';
import { 
  CreateSolicitudDto, 
  AprobarSolicitudDto, 
  RechazarSolicitudDto 
} from '../../models/dtos.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Solicitud[]> {
    return this.api.get<Solicitud[]>('solicitudes');
  }

  getByEstado(estado: EstadoSolicitud): Observable<Solicitud[]> {
    return this.api.get<Solicitud[]>(`solicitudes?estado=${estado}`);
  }

  getByResponsable(responsableId: string): Observable<Solicitud[]> {
    return this.api.get<Solicitud[]>(`solicitudes/responsable/${responsableId}`);
  }

  getBySolicitante(solicitanteId: string): Observable<Solicitud[]> {
    return this.api.get<Solicitud[]>(`solicitudes/solicitante/${solicitanteId}`);
  }

  getOne(id: string): Observable<Solicitud> {
    return this.api.get<Solicitud>(`solicitudes/${id}`);
  }

  getHistorial(id: string): Observable<HistorialSolicitud[]> {
    return this.api.get<HistorialSolicitud[]>(`solicitudes/${id}/historial`);
  }

  create(data: CreateSolicitudDto): Observable<Solicitud> {
    return this.api.post<Solicitud>('solicitudes', data);
  }

  aprobar(id: string, data: AprobarSolicitudDto): Observable<Solicitud> {
    return this.api.post<Solicitud>(`solicitudes/${id}/aprobar`, data);
  }

  rechazar(id: string, data: RechazarSolicitudDto): Observable<Solicitud> {
    return this.api.post<Solicitud>(`solicitudes/${id}/rechazar`, data);
  }
}