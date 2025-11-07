import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { TipoSolicitud } from '../../models/tipo-solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class TiposSolicitudService {
  constructor(private api: ApiService) {}

  getAll(): Observable<TipoSolicitud[]> {
    return this.api.get<TipoSolicitud[]>('tipos-solicitud');
  }

  getOne(id: string): Observable<TipoSolicitud> {
    return this.api.get<TipoSolicitud>(`tipos-solicitud/${id}`);
  }
}