import { HttpInterceptorFn, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const loadingService = inject(LoadingService);

  // Incrementar contador de peticiones
  loadingService.incrementLoading();

  return next(req).pipe(
    finalize(() => {
      // Decrementar contador al finalizar (éxito o error)
      loadingService.decrementLoading();
    })
  );
};