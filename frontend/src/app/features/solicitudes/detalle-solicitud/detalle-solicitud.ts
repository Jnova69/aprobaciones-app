import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/navbar/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SolicitudesService } from '../../../core/services/solicitudes';
import { Solicitud, EstadoSolicitud, HistorialSolicitud } from '../../../models/solicitud.model';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './detalle-solicitud.html',
  styleUrl: './detalle-solicitud.css'
})
export class DetalleSolicitud implements OnInit {
  solicitud: Solicitud | null = null;
  historial: HistorialSolicitud[] = [];
  loading = true;
  procesando = false;
  
  aprobarForm: FormGroup;
  rechazarForm: FormGroup;
  
  EstadoSolicitud = EstadoSolicitud;
  
  // Simulación de usuario actual
  usuarioActualId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private solicitudesService: SolicitudesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.aprobarForm = this.fb.group({
      comentario: ['']
    });

    this.rechazarForm = this.fb.group({
      comentario: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarSolicitud(id);
      this.cargarHistorial(id);
    }
  }

  cargarSolicitud(id: string): void {
    this.loading = true;
    this.solicitudesService.getOne(id).subscribe({
      next: (data) => {
        this.solicitud = data;
        // Simular usuario actual como el responsable
        this.usuarioActualId = data.responsableId;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitud:', error);
        this.snackBar.open('Error al cargar la solicitud', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/solicitudes']);
      }
    });
  }

  cargarHistorial(id: string): void {
    this.solicitudesService.getHistorial(id).subscribe({
      next: (data) => {
        this.historial = data;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
      }
    });
  }

  aprobar(): void {
    if (!this.solicitud) return;

    this.procesando = true;
    const data = {
      usuarioId: this.usuarioActualId,
      comentario: this.aprobarForm.get('comentario')?.value || undefined
    };

    this.solicitudesService.aprobar(this.solicitud.id, data).subscribe({
      next: () => {
        this.snackBar.open('Solicitud aprobada exitosamente', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.cargarSolicitud(this.solicitud!.id);
        this.cargarHistorial(this.solicitud!.id);
        this.procesando = false;
      },
      error: (error) => {
        console.error('Error al aprobar:', error);
        this.snackBar.open(error.error?.message || 'Error al aprobar la solicitud', 'Cerrar', { 
          duration: 3000 
        });
        this.procesando = false;
      }
    });
  }

  rechazar(): void {
    if (!this.solicitud || !this.rechazarForm.valid) {
      this.rechazarForm.markAllAsTouched();
      return;
    }

    this.procesando = true;
    const data = {
      usuarioId: this.usuarioActualId,
      comentario: this.rechazarForm.get('comentario')?.value
    };

    this.solicitudesService.rechazar(this.solicitud.id, data).subscribe({
      next: () => {
        this.snackBar.open('Solicitud rechazada', 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cargarSolicitud(this.solicitud!.id);
        this.cargarHistorial(this.solicitud!.id);
        this.procesando = false;
      },
      error: (error) => {
        console.error('Error al rechazar:', error);
        this.snackBar.open(error.error?.message || 'Error al rechazar la solicitud', 'Cerrar', { 
          duration: 3000 
        });
        this.procesando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/solicitudes']);
  }

  getEstadoClass(estado: string): string {
    return estado.toLowerCase();
  }

  puedeAprobarRechazar(): boolean {
    return this.solicitud?.estado === EstadoSolicitud.PENDIENTE &&
           this.solicitud?.responsableId === this.usuarioActualId;
  }
}