import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/navbar/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolicitudesService } from '../../../core/services/solicitudes';
import { UsuariosService } from '../../../core/services/usuarios';
import { TiposSolicitudService } from '../../../core/services/tipos-solicitud';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario, UserRole } from '../../../models/usuario.model';
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
  administradores: Usuario[] = [];
  tiposSolicitud: TipoSolicitud[] = [];
  loading = false;
  loadingData = true;
  currentUser: Usuario | null = null;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private solicitudesService: SolicitudesService,
    private usuariosService: UsuariosService,
    private tiposSolicitudService: TiposSolicitudService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();

    this.solicitudForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.required]],
      tipoSolicitudId: ['', [Validators.required]],
      solicitanteId: [this.currentUser?.id || '', [Validators.required]], // Usuario actual
      responsableId: ['', [Validators.required]],
    });

    // Deshabilitar el campo de solicitante (siempre es el usuario actual)
    this.solicitudForm.get('solicitanteId')?.disable();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loadingData = true;

    // Cargar solo administradores para el campo responsable
    Promise.all([
      this.usuariosService.getAll().toPromise(),
      this.tiposSolicitudService.getAll().toPromise()
    ]).then(([usuarios, tipos]) => {
      // Filtrar solo administradores activos
      this.administradores = (usuarios || []).filter(u => u.rol === UserRole.ADMIN && u.activo);
      this.tiposSolicitud = tipos || [];
      this.loadingData = false;
    }).catch(error => {
      console.error('Error al cargar datos:', error);
      this.snackBar.open('Error al cargar datos iniciales', 'Cerrar', { duration: 3000 });
      this.loadingData = false;
    });
  }

  onSubmit(): void {
    if (this.solicitudForm.valid && this.currentUser) {
      this.loading = true;
      
      // Obtener el valor incluyendo el campo deshabilitado
      const formValue = {
        ...this.solicitudForm.value,
        solicitanteId: this.currentUser.id // Asegurar que sea el usuario actual
      };

      this.solicitudesService.create(formValue).subscribe({
        next: (solicitud) => {
          this.snackBar.open('Solicitud creada exitosamente. Se ha notificado al responsable.', 'Cerrar', { 
            duration: 5000,
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
  get responsableId() { return this.solicitudForm.get('responsableId'); }
}