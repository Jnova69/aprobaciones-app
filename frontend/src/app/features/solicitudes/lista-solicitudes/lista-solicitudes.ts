import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../shared/navbar/material.module';
import { SolicitudesService } from '../../../core/services/solicitudes';
import { AuthService } from '../../../core/services/auth.service';
import { Solicitud, EstadoSolicitud } from '../../../models/solicitud.model';
import { UserRole } from '../../../models/usuario.model';

@Component({
  selector: 'app-lista-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './lista-solicitudes.html',
  styleUrl: './lista-solicitudes.css'
})
export class ListaSolicitudes implements OnInit {
  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];
  loading = true;
  filtroEstado: string = 'TODAS';
  isAdmin = false;

  displayedColumns: string[] = [
    'codigoSolicitud',
    'titulo',
    'tipoSolicitud',
    'solicitante',
    'responsable',
    'estado',
    'fechaSolicitud',
    'acciones'
  ];

  constructor(
    private solicitudesService: SolicitudesService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.loading = true;
    // El backend ya filtra según el rol del usuario
    this.solicitudesService.getAll().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        this.loading = false;
      }
    });
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'TODAS') {
      this.solicitudesFiltradas = this.solicitudes;
    } else {
      this.solicitudesFiltradas = this.solicitudes.filter(
        s => s.estado === this.filtroEstado
      );
    }
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltro();
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case EstadoSolicitud.PENDIENTE:
        return 'warn';
      case EstadoSolicitud.APROBADO:
        return 'primary';
      case EstadoSolicitud.RECHAZADO:
        return 'accent';
      default:
        return '';
    }
  }

  getEstadoClass(estado: string): string {
    return estado.toLowerCase();
  }
}