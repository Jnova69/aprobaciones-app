import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/navbar/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolicitudesService } from '../../../core/services/solicitudes';
import { UsuariosService } from '../../../core/services/usuarios';
import { TiposSolicitudService } from '../../../core/services/tipos-solicitud';
import { Usuario } from '../../../models/usuario.model';
import { TipoSolicitud } from '../../../models/tipo-solicitud.model';

@Component({
  selector: 'app-crear-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './crear-solicitud.html',
  styleUrl: './crear-solicitud.css'
})
export class CrearSolicitud implements OnInit {
  solicitudForm: FormGroup;
  usuarios: Usuario[] = [];
  tiposSolicitud: TipoSolicitud[] = [];
  loading = false;
  loadingData = true;

  constructor(
    private fb: FormBuilder,
    private solicitudesService: SolicitudesService,
    private usuariosService: UsuariosService,
    private tiposSolicitudService: TiposSolicitudService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.solicitudForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.required]],
      tipoSolicitudId: ['', [Validators.required]],
      solicitanteId: ['', [Validators.required]],
      responsableId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loadingData = true;

    // Cargar usuarios y tipos de solicitud en paralelo
    Promise.all([
      this.usuariosService.getAll().toPromise(),
      this.tiposSolicitudService.getAll().toPromise()
    ]).then(([usuarios, tipos]) => {
      this.usuarios = usuarios || [];
      this.tiposSolicitud = tipos || [];
      this.loadingData = false;
    }).catch(error => {
      console.error('Error al cargar datos:', error);
      this.snackBar.open('Error al cargar datos iniciales', 'Cerrar', { duration: 3000 });
      this.loadingData = false;
    });
  }

  onSubmit(): void {
    if (this.solicitudForm.valid) {
      this.loading = true;
      
      this.solicitudesService.create(this.solicitudForm.value).subscribe({
        next: (solicitud) => {
          this.snackBar.open('Solicitud creada exitosamente', 'Cerrar', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/solicitudes', solicitud.id]);
        },
        error: (error) => {
          console.error('Error al crear solicitud:', error);
          this.snackBar.open('Error al crear la solicitud', 'Cerrar', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    } else {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { 
        duration: 3000 
      });
      this.solicitudForm.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.router.navigate(['/solicitudes']);
  }

  // Getters para validación
  get titulo() { return this.solicitudForm.get('titulo'); }
  get descripcion() { return this.solicitudForm.get('descripcion'); }
  get tipoSolicitudId() { return this.solicitudForm.get('tipoSolicitudId'); }
  get solicitanteId() { return this.solicitudForm.get('solicitanteId'); }
  get responsableId() { return this.solicitudForm.get('responsableId'); }
}