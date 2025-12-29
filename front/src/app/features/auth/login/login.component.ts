import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email = signal('');
  password = signal('');
  error = signal('');
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  updateEmail(event: Event) {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }

  updatePassword(event: Event) {
    const target = event.target as HTMLInputElement;
    this.password.set(target.value);
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    this.error.set('');

    if (!this.email() || !this.password()) {
      this.error.set('Por favor, completa todos los campos');
      return;
    }

    if (!this.isValidEmail(this.email())) {
      this.error.set('Por favor, introduce una dirección de email válida');
      return;
    }

    this.isLoading.set(true);

    try {
      await lastValueFrom(this.authService.login({
        email: this.email(),
        password: this.password()
      }));

      // Login exitoso, redirigir
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.handleLoginError(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleLoginError(error: any): void {
    if (error.status === 401) {
      this.error.set('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
    } else if (error.status === 422) {
      // Error de validación
      const apiError = error.error as ApiError;
      if (apiError.errors) {
        const firstErrorKey = Object.keys(apiError.errors)[0];
        const firstError = apiError.errors[firstErrorKey][0];
        this.error.set(firstError);
      } else {
        this.error.set(apiError.message || 'Datos inválidos');
      }
    } else if (error.status === 0) {
      this.error.set('Error de conexión. Verifica tu conexión a internet.');
    } else if (error.status >= 500) {
      this.error.set('Error del servidor. Por favor, intenta más tarde.');
    } else {
      this.error.set('Error al iniciar sesión. Por favor, intenta nuevamente.');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
