import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Construir URL completa si no es una URL completa
  let apiUrl = req.url;
  if (!req.url.startsWith('http')) {
    apiUrl = `${environment.api.baseUrl}${req.url}`;
  }

  // Preparar headers básicos
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };

  // Solo agregar Content-Type si no es FormData
  // FormData necesita que el navegador establezca automáticamente el Content-Type con el boundary
  if (!(req.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Añadir token de autorización si existe y no es una petición de login
  const token = authService.token();
  if (token && !req.url.includes('/auth/login')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Clonar request con nueva URL y headers
  const modifiedReq = req.clone({
    url: apiUrl,
    setHeaders: headers
  });

  // Procesar respuesta y manejar errores
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !req.url.includes('/auth/refresh')) {
        // Token expirado o inválido, intentar refresh
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Reintento con nuevo token
            const newToken = authService.token();
            if (newToken) {
              const retryReq = modifiedReq.clone({
                setHeaders: {
                  'Authorization': `Bearer ${newToken}`
                }
              });
              return next(retryReq);
            }
            return throwError(() => error);
          }),
          catchError(() => {
            // Si el refresh falla, hacer logout y propagar error
            authService.logout();
            return throwError(() => error);
          })
        );
      }

      // Para otros errores, simplemente propagarlos
      return throwError(() => error);
    })
  );
};