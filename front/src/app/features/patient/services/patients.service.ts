import { Injectable, signal, inject } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import {
  BaseCrudService,
  ApiItemResponse,
} from '../../../core/services/base-crud.service';
import {
  Patient,
  PatientFilters,
  CreatePatientRequest,
} from '../../../shared/models/patient.model';
import { PaginationResponse } from '../../../shared/models/pagination.interface';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';

@Injectable({ providedIn: 'root' })
export class PatientsService extends BaseCrudService<Patient> {
  constructor() {
    super('/patients', 'Paciente');
  }

  private patients = signal<Patient[]>([]);
  private isLoading = signal(false);
  private paginationData = signal<
    PaginationResponse<Patient>['pagination'] | null
  >(null);

  // Getters readonly
  get all() {
    return this.patients.asReadonly();
  }

  get loading() {
    return this.isLoading.asReadonly();
  }

  get pagination() {
    return this.paginationData.asReadonly();
  }

  /**
   * Cargar datos iniciales desde la API
   */
  private loadInitialData(): void {
    this.loadAndSetActivePatientsPaginated();
  }

  /**
   * Crear un nuevo paciente - Conecta con API real
   */
  createPatient(formData: Partial<Patient>): void {
    this.create(formData).subscribe({
      next: (newPatient) => {
        // Recargar la página actual después de crear
        const currentPagination = this.paginationData();
        if (currentPagination) {
          this.loadAndSetActivePatientsPaginated(
            currentPagination.currentPage,
            currentPagination.recordsPerPage
          );
        } else {
          this.loadAndSetActivePatientsPaginated();
        }
      },
      error: () => {
        // Error handling manejado por errorInterceptor
      },
    });
  }

  /**
   * Actualizar un paciente existente - Conecta con API real
   */
  updatePatient(patientId: string | number, formData: Partial<Patient>): void {
    this.update(patientId, formData).subscribe({
      next: (updatedPatient) => {
        // Recargar la página actual después de actualizar
        const currentPagination = this.paginationData();
        if (currentPagination) {
          this.loadAndSetActivePatientsPaginated(
            currentPagination.currentPage,
            currentPagination.recordsPerPage
          );
        } else {
          this.loadAndSetActivePatientsPaginated();
        }
      },
      error: () => {
        // Error handling manejado por errorInterceptor
      },
    });
  }

  /**
   * Eliminar un paciente - Conecta con API real
   */
  deletePatient(patientId: string | number): void {
    this.delete(patientId).subscribe({
      next: () => {
        // Recargar la página actual después de eliminar
        const currentPagination = this.paginationData();
        if (currentPagination) {
          this.loadAndSetActivePatientsPaginated(
            currentPagination.currentPage,
            currentPagination.recordsPerPage
          );
        } else {
          this.loadAndSetActivePatientsPaginated();
        }
      },
      error: () => {
        // Error handling manejado por errorInterceptor
      },
    });
  }

  /**
   * Cargar pacientes activos paginados desde la API
   */
  loadActivePatientsPaginated(
    page = 1,
    per_page = 10,
    filters?: PatientFilters
  ): Observable<PaginationResponse<Patient>> {
    if (filters && this.hasActiveFilters(filters)) {
      return this.loadActivePatientsWithFilters(page, per_page, filters);
    }
    return this.getAllPaginated(page, per_page);
  }

  /**
   * Cargar pacientes activos con filtros (ACTUALIZADO para incluir todos los filtros)
   */
  private loadActivePatientsWithFilters(
    page: number,
    per_page: number,
    filters: PatientFilters
  ): Observable<PaginationResponse<Patient>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', per_page.toString());

    // Add filter parameters only if they have values
    if (filters.first_name?.trim()) {
      params = params.set('first_name', filters.first_name.trim());
    }

    if (filters.last_name?.trim()) {
      params = params.set('last_name', filters.last_name.trim());
    }

    if (filters.email?.trim()) {
      params = params.set('email', filters.email.trim());
    }

    if (filters.dni?.trim()) {
      params = params.set('dni', filters.dni.trim());
    }

    // AÑADIR FILTROS FALTANTES
    if (filters.gender) {
      params = params.set('gender', filters.gender);
    }

    if (filters.clinic_id) {
      params = params.set('clinic_id', filters.clinic_id.toString());
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<PaginationResponse<Patient>>(this.apiUrl, {
      ...this.httpOptions,
      params,
    });
  }

  /**
   * Cargar pacientes eliminados paginados desde la API
   */
  loadDeletedPatientsPaginated(
    page = 1,
    per_page = 10,
    filters?: PatientFilters
  ): Observable<PaginationResponse<Patient>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', per_page.toString()); // El endpoint deleted usa 'limit' en lugar de 'per_page'

    // Add filter parameters only if they have values
    if (filters?.first_name?.trim()) {
      params = params.set('first_name', filters.first_name.trim());
    }

    if (filters?.last_name?.trim()) {
      params = params.set('last_name', filters.last_name.trim());
    }

    if (filters?.email?.trim()) {
      params = params.set('email', filters.email.trim());
    }

    if (filters?.dni?.trim()) {
      params = params.set('dni', filters.dni.trim());
    }

    // AÑADIR FILTROS FALTANTES PARA PACIENTES ELIMINADOS
    if (filters?.gender) {
      params = params.set('gender', filters.gender);
    }

    if (filters?.clinic_id) {
      params = params.set('clinic_id', filters.clinic_id.toString());
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<PaginationResponse<Patient>>(
      `${this.apiUrl}/inactive`,
      {
        ...this.httpOptions,
        params,
      }
    );
  }

  /**
   * Check if filters have any active values
   */
  private hasActiveFilters(filters: PatientFilters): boolean {
    return !!(
      filters.first_name?.trim() ||
      filters.last_name?.trim() ||
      filters.email?.trim() ||
      filters.dni?.trim() ||
      filters.gender ||
      filters.clinic_id ||
      filters.status
    );
  }

  /**
   * Cargar pacientes paginados desde la API (mantener compatibilidad)
   */
  loadPatientsPaginated(
    page = 1,
    per_page = 10
  ): Observable<PaginationResponse<Patient>> {
    return this.loadActivePatientsPaginated(page, per_page);
  }

  /**
   * Cargar pacientes activos paginados y actualizar estado interno
   */
  loadAndSetActivePatientsPaginated(page = 1, per_page = 10): void {
    this.isLoading.set(true);
    this.loadActivePatientsPaginated(page, per_page).subscribe({
      next: (response) => {
        this.patients.set(response.data);
        this.paginationData.set(response.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Cargar pacientes eliminados paginados y actualizar estado interno
   */
  loadAndSetDeletedPatientsPaginated(page = 1, per_page = 10): void {
    this.isLoading.set(true);
    this.loadDeletedPatientsPaginated(page, per_page).subscribe({
      next: (response) => {
        this.patients.set(response.data);
        this.paginationData.set(response.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Cargar pacientes paginados y actualizar estado interno (mantener compatibilidad)
   */
  loadAndSetPatientsPaginated(page = 1, per_page = 10): void {
    this.loadAndSetActivePatientsPaginated(page, per_page);
  }

  /**
   * Cargar pacientes desde la API (sin paginación)
   */
  loadPatients(): void {
    this.isLoading.set(true);
    this.getAll().subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Get patient by ID - compatibility method for existing code
   */
  getPatientById(id: number): Patient | undefined {
    return this.patients().find((patient) => patient.id === id);
  }

  /**
   * Select patient - compatibility method for existing code
   */
  selectPatient(patient: Patient | null): void {
    // This method is kept for compatibility with existing code
    // In the new API pattern, we don't need to track selected patient in service
  }

  /**
   * Add patient - compatibility method that delegates to createPatient
   */
  addPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): void {
    this.createPatient(patient);
  }

  // ============ NEW CRUD METHODS FOR COMPLETE INTEGRATION ============

  /**
   * Create patient with complete API integration
   */
  async createPatientAsync(
    patient: CreatePatientRequest
  ): Promise<Patient | null> {
    try {
      this.loadingService.show();
      const response = await lastValueFrom(
        this.http.post<ApiItemResponse<Patient>>(
          `${this.apiUrl}`,
          patient,
          this.httpOptions
        )
      );

      this.toast.showSuccess('Paciente creado correctamente');

      // Reload current page after creation
      const currentPagination = this.paginationData();
      this.loadAndSetActivePatientsPaginated(
        currentPagination?.currentPage || 1,
        currentPagination?.recordsPerPage || 10
      );

      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      return null;
    } finally {
      this.loadingService.hide();
    }
  }

  /**
   * Update patient with complete API integration
   */
  async updatePatientAsync(
    id: number,
    patient: Partial<Patient>
  ): Promise<Patient | null> {
    try {
      this.loadingService.show();
      const response = await lastValueFrom(
        this.http.put<ApiItemResponse<Patient>>(
          `${this.apiUrl}/${id}`,
          patient,
          this.httpOptions
        )
      );

      this.toast.showSuccess('Paciente actualizado correctamente');

      // Reload current page after update
      const currentPagination = this.paginationData();
      this.loadAndSetActivePatientsPaginated(
        currentPagination?.currentPage || 1,
        currentPagination?.recordsPerPage || 10
      );

      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      return null;
    } finally {
      this.loadingService.hide();
    }
  }

  /**
   * Restore deleted patient
   */
  async restorePatient(id: number): Promise<boolean> {
    try {
      this.loadingService.show();
      await lastValueFrom(
        this.http.put(`${this.apiUrl}/${id}/restore`, { id }, this.httpOptions)
      );

      this.toast.showSuccess('Paciente restaurado correctamente');

      // Reload current page after restore
      const currentPagination = this.paginationData();
      this.loadAndSetDeletedPatientsPaginated(
        currentPagination?.currentPage || 1,
        currentPagination?.recordsPerPage || 10
      );

      return true;
    } catch (error) {
      console.error('Error restoring patient:', error);
      return false;
    } finally {
      this.loadingService.hide();
    }
  }

  /**
   * Filter patients with new filter structure
   */
  async filterPatients(filters: PatientFilters): Promise<Patient[]> {
    try {
      this.loadingService.show();

      let params = new HttpParams();

      // Add filter parameters only if they have values
      if (filters.first_name?.trim()) {
        params = params.set('first_name', filters.first_name.trim());
      }
      if (filters.last_name?.trim()) {
        params = params.set('last_name', filters.last_name.trim());
      }
      if (filters.email?.trim()) {
        params = params.set('email', filters.email.trim());
      }
      if (filters.dni?.trim()) {
        params = params.set('dni', filters.dni.trim());
      }
      if (filters.gender) {
        params = params.set('gender', filters.gender);
      }
      if (filters.clinic_id) {
        params = params.set('clinic_id', filters.clinic_id.toString());
      }

      const response = await lastValueFrom(
        this.http.get<{ data: Patient[] }>(`${this.apiUrl}/filter`, {
          ...this.httpOptions,
          params,
        })
      );

      // Update internal state with filtered results
      this.patients.set(response.data);
      this.paginationData.set(null); // Clear pagination when filtering

      return response.data;
    } catch (error) {
      console.error('Error filtering patients:', error);
      return [];
    } finally {
      this.loadingService.hide();
    }
  }

  /**
   * Load patients with new filters (paginated)
   */
  private loadActivePatientsWithNewFilters(
    page: number,
    per_page: number,
    filters: PatientFilters
  ): Observable<PaginationResponse<Patient>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', per_page.toString());

    // Add filter parameters only if they have values
    if (filters.first_name?.trim()) {
      params = params.set('first_name', filters.first_name.trim());
    }
    if (filters.last_name?.trim()) {
      params = params.set('last_name', filters.last_name.trim());
    }
    if (filters.email?.trim()) {
      params = params.set('email', filters.email.trim());
    }
    if (filters.dni?.trim()) {
      params = params.set('dni', filters.dni.trim());
    }
    if (filters.gender) {
      params = params.set('gender', filters.gender);
    }
    if (filters.clinic_id) {
      params = params.set('clinic_id', filters.clinic_id.toString());
    }

    return this.http.get<PaginationResponse<Patient>>(this.apiUrl, {
      ...this.httpOptions,
      params,
    });
  }

  /**
   * Check if new filters have any active values
   */
  private hasActiveNewFilters(filters: PatientFilters): boolean {
    return !!(
      filters.first_name?.trim() ||
      filters.last_name?.trim() ||
      filters.email?.trim() ||
      filters.dni?.trim() ||
      filters.gender ||
      filters.clinic_id
    );
  }

  /**
   * Load patients with new filter structure (paginated and update state)
   */
  loadAndSetPatientsWithNewFilters(
    filters: PatientFilters,
    page = 1,
    per_page = 10
  ): void {
    if (!this.hasActiveNewFilters(filters)) {
      // If no filters, load normal active patients
      this.loadAndSetActivePatientsPaginated(page, per_page);
      return;
    }

    this.isLoading.set(true);
    this.loadActivePatientsWithNewFilters(page, per_page, filters).subscribe({
      next: (response) => {
        this.patients.set(response.data);
        this.paginationData.set(response.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
