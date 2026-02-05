import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Patient, PatientFiltersExtended } from '../../shared/models/patient.model';
import { PatientsService } from './services/patients.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';
import { Clinic } from '../clinics/models/clinic.model';
import { ClinicsService } from '../clinics/services/clinics.service';
import { ClinicSelectorComponent } from '../../shared/components/clinic-selector/clinic-selector.component';

@Component({
  selector: 'app-patient',
  standalone: true,
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmationModalComponent,
    PatientFormComponent,
    ClinicSelectorComponent,
  ],
})
export class PatientComponent implements OnInit {
  // Services
  private patientsService = inject(PatientsService);
  private clinicsService = inject(ClinicsService);
  private router = inject(Router);

  // State signals
  patients = signal<Patient[]>([]);
  clinics = signal<Clinic[]>([]);
  isLoading = signal(false);
  totalPatients = signal(0);

  // Pagination signals
  currentPage = signal(1);
  pageSize = signal(5);

  // Filter control (single clinic selection)
  clinicControl = new FormControl<number | null>(null);

  // Filters state
  filters = signal<PatientFiltersExtended>({
    patientStatus: 'active',
    clinicIds: [],
    first_name: null,
    last_name: null,
    dni: null,
    email: null,
    gender: null,
    treatmentStatus: null,
  });

  // Modal states
  showCreateForm = signal(false);
  editingPatient = signal<Patient | null>(null);
  deletingPatient = signal<Patient | null>(null);
  restoringPatient = signal<Patient | null>(null);

  // Actions dropdown state
  openDropdownId = signal<number | null>(null);

  // Computed
  showForm = computed(
    () => this.showCreateForm() || this.editingPatient() !== null
  );

  totalPages = computed(() => {
    const total = this.totalPatients();
    const size = this.pageSize();
    return Math.ceil(total / size) || 1;
  });

  // Gender options
  genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
  ];

  // Treatment status options
  treatmentStatusOptions = [
    { value: 'en curso', label: 'En curso' },
    { value: 'fin del tratamiento', label: 'Finalizado' },
    { value: 'en pausa', label: 'En pausa' },
    { value: 'abandono', label: 'Abandono' },
    { value: 'derivación', label: 'Derivación' },
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openDropdownId() === null) return;

    const target = event.target as HTMLElement;
    // Verificar si el clic fue dentro del dropdown o en el botón de acciones
    if (target.closest('.dropdown-menu') || target.closest('.actions-toggle')) {
      return;
    }

    this.closeActionsDropdown();
  }

  ngOnInit(): void {
    this.loadClinics();
    this.loadPatients();
    this.setupClinicControlSubscription();
  }

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

  private setupClinicControlSubscription(): void {
    this.clinicControl.valueChanges.subscribe((value) => {
      // Single clinic selection - convert to array for the filter
      this.filters.update((f) => ({ ...f, clinicIds: value ? [value] : [] }));
    });
  }

  onClinicFilterApplied(): void {
    // No auto-apply - user must click "Buscar" button
  }

  private loadPatients(): void {
    this.isLoading.set(true);
    const currentFilters = this.filters();
    const page = this.currentPage();
    const size = this.pageSize();

    this.patientsService
      .loadPatientsWithExtendedFilters(page, size, currentFilters)
      .subscribe({
        next: (response) => {
          this.patients.set(response.data);
          this.totalPatients.set(response.pagination?.totalRecords || 0);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading patients:', error);
          this.isLoading.set(false);
        },
      });
  }

  onFilterChange(
    filterName: keyof PatientFiltersExtended,
    value: any
  ): void {
    // Handle empty string as null for text fields
    const processedValue =
      typeof value === 'string' && value.trim() === '' ? null : value;

    this.filters.update((f) => ({ ...f, [filterName]: processedValue }));
    // No auto-apply - user must click "Buscar" button
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadPatients();
  }

  clearFilters(): void {
    this.filters.set({
      patientStatus: 'active',
      clinicIds: [],
      first_name: null,
      last_name: null,
      dni: null,
      email: null,
      gender: null,
      treatmentStatus: null,
    });
    this.clinicControl.setValue(null);
    this.currentPage.set(1);
    this.loadPatients();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPatients();
    }
  }

  // Form methods
  openCreateForm(): void {
    this.editingPatient.set(null);
    this.showCreateForm.set(true);
  }

  openEditForm(patient: Patient): void {
    this.closeActionsDropdown();
    this.showCreateForm.set(false);
    this.editingPatient.set(patient);
  }

  closeForm(): void {
    this.showCreateForm.set(false);
    this.editingPatient.set(null);
  }

  handleSave(patientData: Patient): void {
    const editing = this.editingPatient();

    if (editing) {
      this.patientsService.update(editing.id!, patientData).subscribe({
        next: () => {
          this.loadPatients();
        },
      });
    } else {
      this.patientsService.create(patientData).subscribe({
        next: () => {
          this.loadPatients();
        },
      });
    }

    this.closeForm();
  }

  // Delete methods
  openDeleteModal(patient: Patient): void {
    this.closeActionsDropdown();
    this.deletingPatient.set(patient);
  }

  closeDeleteModal(): void {
    this.deletingPatient.set(null);
  }

  handleDeletePatient(): void {
    const deleting = this.deletingPatient();
    if (deleting) {
      this.patientsService.delete(deleting.id!).subscribe({
        next: () => {
          this.loadPatients();
        },
      });
      this.closeDeleteModal();
    }
  }

  // Restore methods
  openRestoreModal(patient: Patient): void {
    this.closeActionsDropdown();
    this.restoringPatient.set(patient);
  }

  closeRestoreModal(): void {
    this.restoringPatient.set(null);
  }

  handleRestorePatient(): void {
    const restoring = this.restoringPatient();
    if (restoring) {
      this.patientsService.restorePatient(restoring.id!).then((success) => {
        if (success) {
          this.loadPatients();
        }
        this.closeRestoreModal();
      });
    }
  }

  // Navigation
  navigateToDetail(patient: Patient): void {
    this.closeActionsDropdown();
    this.router.navigate(['/patient', patient.id]);
  }

  // Actions dropdown
  toggleActionsDropdown(patientId: number, event: Event): void {
    event.stopPropagation();
    if (this.openDropdownId() === patientId) {
      this.openDropdownId.set(null);
    } else {
      this.openDropdownId.set(patientId);
    }
  }

  closeActionsDropdown(): void {
    this.openDropdownId.set(null);
  }

  // Helper methods
  getInitials(patient: Patient): string {
    const first = patient.first_name?.charAt(0)?.toUpperCase() || '';
    const last = patient.last_name?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`;
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatusBadgeClasses(status: string): string {
    const statusMap: Record<string, string> = {
      'en curso': 'bg-green-50 text-green-600',
      'fin del tratamiento': 'bg-blue-50 text-blue-600',
      'en pausa': 'bg-yellow-50 text-yellow-600',
      abandono: 'bg-red-50 text-red-600',
      derivación: 'bg-purple-50 text-purple-600',
    };
    return statusMap[status] || 'bg-gray-50 text-gray-500';
  }

  getStatusLabel(status: string): string {
    const option = this.treatmentStatusOptions.find((o) => o.value === status);
    return option?.label || status;
  }

  getGenderLabel(gender: string): string {
    const option = this.genderOptions.find((o) => o.value === gender);
    return option?.label || gender;
  }

  trackByPatientId(index: number, patient: Patient): number {
    return patient?.id || index;
  }
}
