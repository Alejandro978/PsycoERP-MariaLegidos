import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log del error para desarrollo
      console.error('HTTP Error:', error);

      let errorMessage = 'Ha ocurrido un error';
      let shouldShowToast = true;

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error de conexión: ${error.error.message}`;
      } else {
        // Priorizar el mensaje de error del backend (error.error.error)
        // Si no existe, intentar con error.error.message
        // Si no existe ninguno, usar mensajes genéricos por código de estado
        const backendError = error.error?.error || error.error?.message;

        // Error del lado del servidor
        switch (error.status) {
          case 0:
            errorMessage =
              'No se pudo conectar con el servidor. Verifica tu conexión.';
            break;
          case 400:
            errorMessage =
              backendError || 'Datos inválidos. Revisa la información enviada';
            break;
          case 401:
            errorMessage =
              backendError ||
              'Sesión expirada. Por favor, inicia sesión nuevamente.';
            // Aquí se podría redirigir al login
            break;
          case 403:
            errorMessage =
              backendError || 'No tienes permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = backendError || 'Recurso no encontrado';
            break;
          case 409:
            errorMessage = backendError || 'El recurso ya existe';
            break;
          case 422:
            errorMessage =
              backendError || 'Los datos proporcionados no son válidos';
            break;
          case 500:
            errorMessage =
              backendError ||
              'Error interno del servidor. Inténtalo más tarde.';
            break;
          case 503:
            errorMessage =
              backendError || 'Servicio no disponible. Inténtalo más tarde';
            break;
          default:
            if (error.status >= 500) {
              errorMessage =
                backendError ||
                'Error interno del servidor. Inténtalo más tarde.';
            } else {
              errorMessage =
                backendError || `Error ${error.status}: ${error.message}`;
            }
        }
      }

      if (shouldShowToast) {
        toast.showError(errorMessage);
      }

      // Re-lanzar el error con el mensaje procesado
      return throwError(() => ({ ...error, processedMessage: errorMessage }));
    })
  );
};
