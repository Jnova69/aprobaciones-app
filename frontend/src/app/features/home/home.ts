import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/navbar/material.module';
import { SolicitudesService } from '../../core/services/solicitudes';
import { Solicitud, EstadoSolicitud } from '../../models/solicitud.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  totalSolicitudes = 0;
  pendientes = 0;
  aprobadas = 0;
  rechazadas = 0;
  loading = true;

  constructor(private solicitudesService: SolicitudesService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.solicitudesService.getAll().subscribe({
      next: (solicitudes: Solicitud[]) => {
        this.totalSolicitudes = solicitudes.length;
        this.pendientes = solicitudes.filter(s => s.estado === EstadoSolicitud.PENDIENTE).length;
        this.aprobadas = solicitudes.filter(s => s.estado === EstadoSolicitud.APROBADO).length;
        this.rechazadas = solicitudes.filter(s => s.estado === EstadoSolicitud.RECHAZADO).length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.loading = false;
      }
    });
  }
}
