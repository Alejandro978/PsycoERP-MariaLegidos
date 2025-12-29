import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Patient, PatientFilters } from '../../shared/models/patient.model';
import { PatientsService } from './services/patients.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { PatientsListComponent } from './components/patients-list/patients-list.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';
import { PatientFiltersModalComponent } from './components/patient-filters-modal/patient-filters-modal.component';
import { Clinic } from '../clinics/models/clinic.model';
import { ClinicsService } from '../clinics/services/clinics.service';

type TabType = 'active' | 'inactive';

@Component({
  selector: 'app-patient',
  standalone: true,
  templateUrl: './patient.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
    SectionHeaderComponent,
    PatientsListComponent,
    PaginationComponent,
    PatientFormComponent,
    PatientFiltersModalComponent,
  ],
})
export class PatientComponent implements OnInit {
  // Services
  private patientsService = inject(PatientsService);
  private clinicsService = inject(ClinicsService);
  private router = inject(Router);

  // State signals
  showCreateForm = signal(false);
  editingPatient = signal<Patient | null>(null);
  deletingPatient = signal<Patient | null>(null);
  restoringPatient = signal<Patient | null>(null);
  activeTab = signal<TabType>('active');

  // Filters state
  showFiltersModal = signal(false);
  currentFilters = signal<PatientFilters>({});

  // Clinics shared state
  clinics = signal<Clinic[]>([]);

  // Separate state for each tab
  activePatients = signal<Patient[]>([]);
  deletedPatients = signal<Patient[]>([]);

  // Loading is handled globally by LoadingInterceptor - no local loading needed

  // Separate pagination states
  activePagination = signal<any>(null);
  deletedPagination = signal<any>(null);

  // Separate counts
  activePatientsCount = signal(0);
  deletedPatientsCount = signal(0);

  // Computed signals based on active tab
  patientsList = computed(() => {
    return this.activeTab() === 'active'
      ? this.activePatients()
      : this.deletedPatients();
  });

  paginationData = computed(() => {
    return this.activeTab() === 'active'
      ? this.activePagination()
      : this.deletedPagination();
  });

  showForm = computed(
    () => this.showCreateForm() || this.editingPatient() !== null
  );

  constructor() {
    // No effect needed - load data explicitly
  }

  ngOnInit() {
    // Load clinics once for all child components
    this.loadClinics();

    // Load data for both tabs to show correct counts
    this.loadActivePatients(1, 12);
    this.loadDeletedPatients(1, 12);
  }

  /**
   * Load clinics once to share with child components
   */
  private loadClinics(): void {
    this.clinicsService.loadActiveClinics(1, 1000).subscribe({
      next: (response) => {
        this.clinics.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading clinics:', error);
        this.clinics.set([]);
      },
    });
  }

  /**
   * Cargar pacientes activos
   */
  private loadActivePatients(page: number, perPage: number): void {
    const filters = this.currentFilters();
    this.patientsService
      .loadActivePatientsPaginated(page, perPage, filters)
      .subscribe({
        next: (response) => {
          this.activePatients.set(response.data);
          this.activePagination.set(response.pagination);
          this.activePatientsCount.set(response.pagination?.totalRecords || 0);
        },
        error: () => {
          // Error handling is managed by error interceptor
        },
      });
  }

  /**
   * Cargar pacientes eliminados
   */
  private loadDeletedPatients(page: number, perPage: number): void {
    const filters = this.currentFilters();
    this.patientsService
      .loadDeletedPatientsPaginated(page, perPage, filters)
      .subscribe({
        next: (response) => {
          this.deletedPatients.set(response.data);
          this.deletedPagination.set(response.pagination);
          this.deletedPatientsCount.set(response.pagination?.totalRecords || 0);
        },
        error: () => {
          // Error handling is managed by error interceptor
        },
      });
  }

  /**
   * Abrir modal para crear nuevo paciente
   */
  openCreateForm(): void {
    this.editingPatient.set(null);
    this.showCreateForm.set(true);
  }

  /**
   * Abrir modal para editar paciente
   */
  openEditForm(patient: Patient): void {
    this.showCreateForm.set(false);
    this.editingPatient.set(patient);
  }

  /**
   * Cerrar modal de formulario
   */
  closeForm(): void {
    this.showCreateForm.set(false);
    this.editingPatient.set(null);
  }

  /**
   * Manejar guardado del formulario (crear/editar)
   */
  handleSave(patientData: Patient): void {
    const editing = this.editingPatient();

    if (editing) {
      // Editar paciente existente
      this.patientsService.update(editing.id!, patientData).subscribe({
        next: () => {
          // Reload both tabs to update counts and data
          this.reloadBothTabs();
        },
      });
    } else {
      // Crear nuevo paciente
      this.patientsService.create(patientData).subscribe({
        next: () => {
          // Reload active patients (new patients go to active)
          const activePag = this.activePagination();
          this.loadActivePatients(
            activePag?.currentPage || 1,
            activePag?.recordsPerPage || 10
          );
        },
      });
    }

    this.closeForm();
  }

  /**
   * Abrir modal de confirmación de eliminación
   */
  openDeleteModal(patient: Patient): void {
    this.deletingPatient.set(patient);
  }

  /**
   * Cerrar modal de eliminación
   */
  closeDeleteModal(): void {
    this.deletingPatient.set(null);
  }

  /**
   * Eliminar paciente
   */
  handleDeletePatient(): void {
    const deleting = this.deletingPatient();
    if (deleting) {
      this.patientsService.delete(deleting.id!).subscribe({
        next: () => {
          // Reload both tabs to update counts
          this.reloadBothTabs();
        },
      });
      this.closeDeleteModal();
    }
  }

  /**
   * Abrir modal de confirmación de restauración
   */
  openRestoreModal(patient: Patient): void {
    this.restoringPatient.set(patient);
  }

  /**
   * Cerrar modal de restauración
   */
  closeRestoreModal(): void {
    this.restoringPatient.set(null);
  }

  /**
   * Restaurar paciente
   */
  handleRestorePatient(): void {
    const restoring = this.restoringPatient();
    if (restoring) {
      this.patientsService.restorePatient(restoring.id!).then((success) => {
        if (success) {
          // Reload both tabs to update counts
          this.reloadBothTabs();
        }
        this.closeRestoreModal();
      });
    }
  }

  /**
   * Recargar datos de la pestaña actual
   */
  private reloadCurrentTab(): void {
    const tab = this.activeTab();
    if (tab === 'active') {
      const activePag = this.activePagination();
      this.loadActivePatients(
        activePag?.currentPage || 1,
        activePag?.recordsPerPage || 10
      );
    } else {
      const deletedPag = this.deletedPagination();
      this.loadDeletedPatients(
        deletedPag?.currentPage || 1,
        deletedPag?.recordsPerPage || 10
      );
    }
  }

  /**
   * Recargar datos de ambas pestañas para actualizar contadores
   */
  private reloadBothTabs(): void {
    const activePag = this.activePagination();
    const deletedPag = this.deletedPagination();

    this.loadActivePatients(
      activePag?.currentPage || 1,
      activePag?.recordsPerPage || 10
    );
    this.loadDeletedPatients(
      deletedPag?.currentPage || 1,
      deletedPag?.recordsPerPage || 10
    );
  }

  /**
   * Cambiar pestaña activa
   */
  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
    // No need to load data - both tabs are loaded on init
  }

  /**
   * Obtener clases CSS para las pestañas
   */
  getTabClasses(tab: TabType): string {
    const baseClasses =
      "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground h-[calc(100%-1px)] flex-1 justify-center rounded-md border border-transparent px-2 py-1 whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 flex items-center gap-2 text-sm font-medium";

    return this.activeTab() === tab
      ? `${baseClasses} bg-background text-foreground shadow-sm`
      : baseClasses;
  }

  /**
   * Manejar cambio de página
   */
  onPageChange(page: number): void {
    const tab = this.activeTab();
    const perPage = this.paginationData()?.recordsPerPage || 10;

    if (tab === 'active') {
      this.loadActivePatients(page, perPage);
    } else {
      this.loadDeletedPatients(page, perPage);
    }
  }

  /**
   * Manejar cambio de tamaño de página
   */
  onPageSizeChange(size: number): void {
    const tab = this.activeTab();

    if (tab === 'active') {
      this.loadActivePatients(1, size);
    } else {
      this.loadDeletedPatients(1, size);
    }
  }

  /**
   * Navigate to patient detail
   */
  navigateToDetail(patient: Patient): void {
    this.router.navigate(['/patient', patient.id]);
  }

  /**
   * Track by function para ngFor
   */
  trackByPatientId(index: number, patient: Patient): number {
    return patient?.id || index;
  }

  /**
   * Open filters modal
   */
  openFiltersModal(): void {
    this.showFiltersModal.set(true);
  }

  /**
   * Close filters modal
   */
  closeFiltersModal(): void {
    this.showFiltersModal.set(false);
  }

  /**
   * Apply filters and reload data
   */
  handleApplyFilters(filters: PatientFilters): void {
    this.currentFilters.set(filters);
    this.closeFiltersModal();

    // Reload current tab with filters from page 1
    this.reloadCurrentTabFromBeginning();
  }

  /**
   * Clear all filters and reload data
   */
  handleClearFilters(): void {
    this.currentFilters.set({});
    this.closeFiltersModal();

    // Reload current tab without filters from page 1
    this.reloadCurrentTabFromBeginning();
  }

  /**
   * Reload current tab from page 1 (used when filters change)
   */
  private reloadCurrentTabFromBeginning(): void {
    const tab = this.activeTab();
    const perPage = this.paginationData()?.recordsPerPage || 12;

    if (tab === 'active') {
      this.loadActivePatients(1, perPage);
    } else {
      this.loadDeletedPatients(1, perPage);
    }
  }
}
