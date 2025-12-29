import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, finalize } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { LoadingService } from './loading.service';
import { PaginationResponse } from '../../shared/models/pagination.interface';
import { environment } from '../../../environments/environment';

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
}

export interface ApiItemResponse<T> {
  data: T;
}

@Injectable()
export abstract class BaseCrudService<T> {
  http = inject(HttpClient);
  toast = inject(ToastService);
  loadingService = inject(LoadingService);

  readonly endpoint: string;
  readonly entityName: string;

  constructor(endpoint: string, entityName?: string) {
    this.endpoint = endpoint;
    this.entityName = entityName || endpoint.replace('/', '').slice(0, -1); // Remove '/' and last 's'
  }

  get apiUrl(): string {
    return this.endpoint;
  }

  get httpOptions() {
    return {
      // Headers básicos - el interceptor agregará los demás automáticamente
      headers: new HttpHeaders({
        Accept: 'application/json',
      }),
      responseType: 'json' as const,
    };
  }

  getAll(): Observable<T[]> {
    this.loadingService.show();

    return this.http
      .get<ApiListResponse<T>>(this.apiUrl, {
        ...this.httpOptions,
      })
      .pipe(
        map((response: ApiListResponse<T>) => response.data),
        finalize(() => this.loadingService.hide())
      );
  }

  getAllPaginated(page = 1, per_page = 10): Observable<PaginationResponse<T>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', per_page.toString());
    
    this.loadingService.show();
    
    return this.http
      .get<PaginationResponse<T>>(this.apiUrl, {
        ...this.httpOptions,
        params,
      })
      .pipe(
        finalize(() => this.loadingService.hide())
      );
  }

  getById(id: string | number): Observable<T> {
    this.loadingService.show();

    return this.http
      .get<ApiItemResponse<T>>(`${this.apiUrl}/${id}`, {
        ...this.httpOptions,
      })
      .pipe(
        map((response: ApiItemResponse<T>) => response.data),
        finalize(() => this.loadingService.hide())
      );
  }

  create(item: Partial<T>): Observable<T> {
    this.loadingService.show();

    return this.http
      .post<ApiItemResponse<T>>(this.apiUrl, item, {
        ...this.httpOptions,
      })
      .pipe(
        map((response: ApiItemResponse<T>) => {
          this.toast.showSuccess(`${this.entityName} creado correctamente`);
          return response.data;
        }),
        finalize(() => this.loadingService.hide())
      );
  }

  update(id: string | number, item: Partial<T>): Observable<T> {
    this.loadingService.show();

    return this.http
      .put<ApiItemResponse<T>>(`${this.apiUrl}/${id}`, item, {
        ...this.httpOptions,
      })
      .pipe(
        map((response: ApiItemResponse<T>) => {
          this.toast.showSuccess(
            `${this.entityName} actualizada correctamente`
          );
          return response.data;
        }),
        finalize(() => this.loadingService.hide())
      );
  }

  delete(id: string | number): Observable<void> {
    this.loadingService.show();

    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, {
        ...this.httpOptions,
        responseType: 'json' as const,
      })
      .pipe(
        tap(() => {
          this.toast.showSuccess(`${this.entityName} eliminada correctamente`);
        }),
        finalize(() => this.loadingService.hide())
      );
  }

  // Método helper para extraer datos de respuestas de API
  extractData<R>(response: ApiListResponse<R> | ApiItemResponse<R>): R | R[] {
    return response.data;
  }

  // Método para operaciones personalizadas con manejo de errores automático
  performRequest<R>(
    request: Observable<R>,
    successMessage?: string
  ): Observable<R> {
    return request.pipe(
      tap(() => {
        if (successMessage) {
          this.toast.showSuccess(successMessage);
        }
      })
      // Error handling ahora manejado por errorInterceptor
    );
  }
}
