import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar token en localStorage (más confiable que signals)
  const token = localStorage.getItem('auth_token');
  const expirationString = localStorage.getItem('token_expiration');

  // Si no hay token, redirigir al login
  if (!token || !expirationString) {
    authService.logout();
    return router.parseUrl('/auth/login');
  }

  // Verificar si el token ha expirado
  try {
    const expiration = new Date(expirationString);
    const now = new Date();

    if (expiration <= now) {
      // Token expirado
      authService.logout();
      return router.parseUrl('/auth/login');
    }
  } catch (error) {
    // Error al parsear la fecha
    authService.logout();
    return router.parseUrl('/auth/login');
  }

  // Verificar también el estado del servicio (doble verificación)
  if (!authService.isAuthenticated()) {
    authService.logout();
    return router.parseUrl('/auth/login');
  }

  return true;
};
