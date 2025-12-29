import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';
import { Clinic } from '../models/clinic.model';

/**
 * Servicio para gestionar las clínicas
 * Extiende BaseCrudService para operaciones CRUD con manejo de errores automático
 * Maneja el estado global de las clínicas usando signals
 */
@Injectable({ providedIn: 'root' })
export class ClinicsService extends BaseCrudService<Clinic> {
  constructor() {
    super('/clinics', 'Clínica');
  }

  private clinics = signal<Clinic[]>([]);

  // Getters readonly
  get all() {
    return this.clinics.asReadonly();
  }

  /**
   * Load active clinics with pagination - calls /clinics?page=1&limit=12
   */
  loadActiveClinics(page: number, limit: number): Observable<any> {
    return this.getAllPaginated(page, limit);
  }

  /**
   * Load inactive clinics with pagination - calls /clinics/deleted?page=1&limit=12
   */
  loadInactiveClinics(page: number, limit: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    this.loadingService.show();

    return this.http
      .get<any>(`${this.apiUrl}/deleted`, { params })
      .pipe(
        finalize(() => this.loadingService.hide())
      );
  }

  /**
   * Crear una nueva clínica - Conecta con API real
   */
  createClinic(formData: Clinic): Observable<Clinic> {
    return this.create(formData);
  }

  /**
   * Actualizar una clínica existente - Conecta con API real
   */
  updateClinic(clinicId: string, formData: Clinic): Observable<Clinic> {
    return this.update(clinicId, formData);
  }

  /**
   * Eliminar una clínica - Conecta con API real
   */
  deleteClinic(clinicId: string): Observable<void> {
    return this.delete(clinicId);
  }

  /**
   * Cargar clínicas desde la API (for backward compatibility)
   */
  loadClinics(): void {
    // El loading se maneja automáticamente en BaseCrudService
    this.getAll().subscribe({
      next: (clinics) => {
        this.clinics.set(clinics);
      },
      error: () => {
        // Error handling manejado por errorInterceptor
      },
    });
  }
}
