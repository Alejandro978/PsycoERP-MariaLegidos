import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, of, map } from 'rxjs';
import {
  InvoiceKPIs,
  PendingInvoicesResponse,
  ExistingInvoicesResponse,
  ApiResponse,
  CreateBulkInvoicesRequest,
  CreateInvoiceResponse,
  PendingClinicInvoicesResponse,
  ExistingClinicInvoice
} from '../models/billing.models';
import { environment } from '../../../../environments/environment';

/**
 * Servicio para gestión de facturación
 * Maneja KPIs, facturas pendientes y existentes
 */
@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.api.baseUrl;

  // Signals para estado interno
  private kpisData = signal<InvoiceKPIs | null>(null);
  private pendingData = signal<PendingInvoicesResponse | null>(null);
  private existingData = signal<ExistingInvoicesResponse | null>(null);

  private loadingKPIs = signal(false);
  private loadingPending = signal(false);
  private loadingExisting = signal(false);

  private error = signal<string | null>(null);

  // Getters readonly para signals
  get kpis() {
    return this.kpisData.asReadonly();
  }

  get pending() {
    return this.pendingData.asReadonly();
  }

  get existing() {
    return this.existingData.asReadonly();
  }

  get isLoadingKPIs() {
    return this.loadingKPIs.asReadonly();
  }

  get isLoadingPending() {
    return this.loadingPending.asReadonly();
  }

  get isLoadingExisting() {
    return this.loadingExisting.asReadonly();
  }

  get lastError() {
    return this.error.asReadonly();
  }

  /**
   * Obtiene los KPIs de facturación filtrados por mes y año
   */
  getKPIs(month: number, year: number): Observable<ApiResponse<InvoiceKPIs>> {
    this.loadingKPIs.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<ApiResponse<InvoiceKPIs>>(`${this.baseUrl}/invoices/kpis`, { params })
      .pipe(
        tap(response => {
          this.kpisData.set(response.data);
          this.loadingKPIs.set(false);
        }),
        catchError(error => {
          console.error('Error al obtener KPIs:', error);
          this.error.set('Error al cargar los KPIs de facturación');
          this.loadingKPIs.set(false);
          this.kpisData.set(null);
          return of({ data: this.getEmptyKPIs(month, year) });
        })
      );
  }

  /**
   * Obtiene las facturas pendientes filtradas por mes y año
   */
  getPendingInvoices(month: number, year: number): Observable<ApiResponse<PendingInvoicesResponse>> {
    this.loadingPending.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<ApiResponse<PendingInvoicesResponse>>(`${this.baseUrl}/invoices/pending`, { params })
      .pipe(
        tap(response => {
          this.pendingData.set(response.data);
          this.loadingPending.set(false);
        }),
        catchError(error => {
          console.error('Error al obtener facturas pendientes:', error);
          this.error.set('Error al cargar las facturas pendientes');
          this.loadingPending.set(false);
          this.pendingData.set(null);
          return of({ data: this.getEmptyPending(month, year) });
        })
      );
  }

  /**
   * Obtiene las facturas existentes filtradas por mes y año
   */
  getExistingInvoices(month: number, year: number): Observable<ApiResponse<ExistingInvoicesResponse>> {
    this.loadingExisting.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<ApiResponse<ExistingInvoicesResponse>>(`${this.baseUrl}/invoices`, { params })
      .pipe(
        tap(response => {
          this.existingData.set(response.data);
          this.loadingExisting.set(false);
        }),
        catchError(error => {
          console.error('Error al obtener facturas existentes:', error);
          this.error.set('Error al cargar las facturas existentes');
          this.loadingExisting.set(false);
          this.existingData.set(null);
          return of({ data: this.getEmptyExisting(month, year) });
        })
      );
  }

  /**
   * Obtiene el último número de factura para un año determinado
   */
  getLastInvoiceNumber(year: number): Observable<{ year: number; last_invoice_number: number }> {
    const params = new HttpParams().set('year', year.toString());

    return this.http.get<{ year: number; last_invoice_number: number }>(
      `${this.baseUrl}/invoices/last-number`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Error al obtener último número de factura:', error);
        // Si no hay facturas para ese año, devolver 0
        return of({ year, last_invoice_number: 0 });
      })
    );
  }

  /**
   * Obtiene las facturas pendientes de clínicas filtradas por mes y año
   */
  getPendingClinicInvoices(month: number, year: number): Observable<ApiResponse<PendingClinicInvoicesResponse>> {
    this.error.set(null);

    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<ApiResponse<PendingClinicInvoicesResponse>>(`${this.baseUrl}/invoices/pending-of-clinics`, { params })
      .pipe(
        catchError(error => {
          console.error('Error al obtener facturas pendientes de clínicas:', error);
          this.error.set('Error al cargar las facturas pendientes de clínicas');
          return of({ data: [] });
        })
      );
  }

  /**
   * Crea facturas en bulk
   */
  createBulkInvoices(invoices: CreateBulkInvoicesRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/invoices`, invoices).pipe(
      catchError(error => {
        console.error('Error al crear facturas:', error);

        // Si el error tiene un body con información (error.error), lo retornamos
        if (error.error && typeof error.error === 'object') {
          return of(error.error);
        }

        this.error.set('Error al crear las facturas');
        return of({ success: false, message: error.message || 'Error al crear las facturas' });
      })
    );
  }

  /**
   * Emite facturas para clínicas
   */
  emitClinicInvoice(clinicId: number, month: number, year: number, invoiceNumber: string, invoiceDate: string, concept: string, total: number): Observable<any> {
    const payload = {
      clinic_id: clinicId,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      concept,
      total,
      month,
      year
    };

    return this.http.post<any>(`${this.baseUrl}/invoices/of-clinics`, payload).pipe(
      catchError(error => {
        console.error('Error al emitir factura de clínica:', error);

        if (error.error && typeof error.error === 'object') {
          return of(error.error);
        }

        this.error.set('Error al emitir la factura de la clínica');
        return of({ success: false, message: error.message || 'Error al emitir la factura' });
      })
    );
  }

  /**
   * Obtiene las facturas existentes de clínicas filtradas por mes y año
   */
  getExistingClinicInvoices(month: number, year: number): Observable<ExistingClinicInvoice[]> {
    this.error.set(null);

    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<ApiResponse<ExistingClinicInvoice[]>>(`${this.baseUrl}/invoices/of-clinics`, { params })
      .pipe(
        map(response => {
          // Si la respuesta tiene la estructura { data: [...] }, extraemos el array
          // Si no, asumimos que ya es un array directo
          if (response && 'data' in response) {
            return Array.isArray(response.data) ? response.data : [];
          }
          return Array.isArray(response) ? response : [];
        }),
        catchError(error => {
          console.error('Error al obtener facturas existentes de clínicas:', error);
          this.error.set('Error al cargar las facturas existentes de clínicas');
          return of([]);
        })
      );
  }

  // Helpers para respuestas vacías
  private getEmptyKPIs(month: number, year: number): InvoiceKPIs {
    return {
      filters_applied: { month, year },
      card1_total_invoices_issued: 0,
      card2_total_gross_historic: 0,
      card3_total_gross_filtered: 0,
      card4_total_net_filtered: 0,
      card5_total_net_by_clinic: []
    };
  }

  private getEmptyPending(month: number, year: number): PendingInvoicesResponse {
    return {
      filters_applied: { month, year },
      pending_invoices: []
    };
  }

  private getEmptyExisting(month: number, year: number): ExistingInvoicesResponse {
    return {
      filters_applied: { month, year },
      total_invoices: 0,
      invoices: []
    };
  }
}
