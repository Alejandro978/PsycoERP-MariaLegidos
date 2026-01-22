import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap, map } from 'rxjs/operators';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  Invitation,
  InvitationFilters,
  InvitationResponse,
  GenerateInvitationResponse,
} from '../models/invitation.model';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);
  private toast = inject(ToastService);

  private readonly apiUrl = '/invitations';

  private get httpOptions() {
    return {
      headers: new HttpHeaders({
        Accept: 'application/json',
      }),
      responseType: 'json' as const,
    };
  }

  getInvitations(filters: InvitationFilters): Observable<InvitationResponse> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('limit', filters.limit.toString());

    if (filters.estado) {
      params = params.set('status', filters.estado);
    }
    if (filters.fecha_desde) {
      params = params.set('fecha_desde', filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      params = params.set('fecha_hasta', filters.fecha_hasta);
    }

    this.loadingService.show();

    return this.http
      .get<any>(this.apiUrl, {
        ...this.httpOptions,
        params,
      })
      .pipe(
        map((response) => ({
          data: response.data,
          pagination: {
            total: response.pagination.totalRecords,
            page: response.pagination.currentPage,
            limit: response.pagination.recordsPerPage,
            totalPages: response.pagination.totalPages,
          },
        })),
        finalize(() => this.loadingService.hide())
      );
  }

  generateInvitation(clinicId: number): Observable<GenerateInvitationResponse> {
    this.loadingService.show();

    return this.http
      .post<GenerateInvitationResponse>(
        `${this.apiUrl}/generate`,
        { clinic_id: clinicId },
        this.httpOptions
      )
      .pipe(
        tap(() => {
          this.toast.showSuccess('Invitacion generada correctamente');
        }),
        finalize(() => this.loadingService.hide())
      );
  }

  deleteInvitation(id: number): Observable<void> {
    this.loadingService.show();

    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        tap(() => {
          this.toast.showSuccess('Invitacion eliminada correctamente');
        }),
        finalize(() => this.loadingService.hide())
      );
  }
}
