import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Usuario } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>('usuarios');
  }

  getOne(id: string): Observable<Usuario> {
    return this.api.get<Usuario>(`usuarios/${id}`);
  }

  getByUsuarioRed(usuarioRed: string): Observable<Usuario> {
    return this.api.get<Usuario>(`usuarios/usuario-red/${usuarioRed}`);
  }
}