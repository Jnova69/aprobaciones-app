import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/navbar/material.module';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      usuarioRed: ['', [Validators.required, Validators.maxLength(100)]],
      nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      area: ['', [Validators.maxLength(100)]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para la fortaleza de la contraseña
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    if (!valid) {
      return { passwordStrength: true };
    }
    return null;
  }

  // Validador para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    if (confirmPassword.value === '') return null;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Si las contraseñas coinciden, limpiar el error
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;

      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.snackBar.open(
            '¡Registro exitoso! Se ha enviado un email de bienvenida.', 
            'Cerrar', 
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          const message = error.error?.message || 'Error al registrar usuario';
          this.snackBar.open(message, 'Cerrar', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', { 
        duration: 3000 
      });
    }
  }

  // Getters para validación
  get usuarioRed() { return this.registerForm.get('usuarioRed'); }
  get nombreCompleto() { return this.registerForm.get('nombreCompleto'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get area() { return this.registerForm.get('area'); }
}