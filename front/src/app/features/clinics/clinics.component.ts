import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicsService } from './services/clinics.service';
import { Clinic } from './models/clinic.model';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { ClinicsListComponent } from './components/clinics-list/clinics-list.component';
import { ClinicFormComponent } from './components/clinic-form/clinic-form.component';

@Component({
  selector: 'app-clinics',
  standalone: true,
  templateUrl: './clinics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
    ClinicFormComponent,
    ClinicsListComponent,
    PaginationComponent,
    SectionHeaderComponent,
  ],
})
export class ClinicsComponent implements OnInit {
  // Services
  private clinicsService = inject(ClinicsService);

  // State signals
  showCreateForm = signal(false);
  editingClinica = signal<Clinic | null>(null);
  deletingClinic = signal<Clinic | null>(null);
  restoringClinic = signal<Clinic | null>(null);

  // Only active clinics state
  clinicsList = signal<Clinic[]>([]);
  paginationData = signal<any>(null);

  showForm = computed(
    () => this.showCreateForm() || this.editingClinica() !== null
  );

  ngOnInit() {
    // Load only active clinics
    this.loadActiveClinics(1, 12);
  }

  /**
   * Load active clinics with pagination
   */
  private loadActiveClinics(page: number, perPage: number): void {
    this.clinicsService.loadActiveClinics(page, perPage).subscribe({
      next: (response) => {
        this.clinicsList.set(response.data);
        this.paginationData.set(response.pagination);
      },
      error: () => {
        // Error handling is managed by error interceptor
      },
    });
  }


  /**
   * Abrir modal para crear nueva clínica
   */
  openCreateForm(): void {
    this.editingClinica.set(null);
    this.showCreateForm.set(true);
  }

  /**
   * Abrir modal para editar clínica
   */
  openEditForm(clinic: Clinic): void {
    this.showCreateForm.set(false);
    this.editingClinica.set(clinic);
  }

  /**
   * Cerrar modal de formulario
   */
  closeForm(): void {
    this.showCreateForm.set(false);
    this.editingClinica.set(null);
  }

  /**
   * Manejar guardado del formulario (crear/editar)
   */
  handleSave(clinicData: Clinic): void {
    const editing = this.editingClinica();

    if (editing) {
      // Editar clínica existente
      this.clinicsService.updateClinic(editing.id!, clinicData as Clinic).subscribe({
        next: () => {
          this.reloadActiveClinics();
        }
      });
    } else {
      // Crear nueva clínica
      this.clinicsService.createClinic(clinicData as Clinic).subscribe({
        next: () => {
          // Reload active clinics (new clinics go to active)
          this.reloadActiveClinics();
        }
      });
    }

    this.closeForm();
  }

  /**
   * Abrir modal de confirmación de eliminación
   */
  openDeleteModal(clinic: Clinic): void {
    this.deletingClinic.set(clinic);
  }

  /**
   * Cerrar modal de eliminación
   */
  closeDeleteModal(): void {
    this.deletingClinic.set(null);
  }

  /**
   * Eliminar clínica
   */
  handleDeleteClinic(): void {
    const deleting = this.deletingClinic();
    if (deleting) {
      this.clinicsService.deleteClinic(deleting.id!).subscribe({
        next: () => {
          // Reload active clinics to update list
          this.reloadActiveClinics();
        }
      });
      this.closeDeleteModal();
    }
  }

  /**
   * Abrir modal de confirmación de restauración
   */
  openRestoreModal(clinic: Clinic): void {
    this.restoringClinic.set(clinic);
  }

  /**
   * Cerrar modal de restauración
   */
  closeRestoreModal(): void {
    this.restoringClinic.set(null);
  }

  /**
   * Restaurar clínica
   */
  handleRestoreClinic(): void {
    const restoring = this.restoringClinic();
    if (restoring) {
      // TODO: Implement restore functionality in service

      // Simulate restore by changing status to active
      const updatedClinic = { ...restoring, status: 'active' };
      this.clinicsService.updateClinic(restoring.id!, updatedClinic).subscribe({
        next: () => {
          this.reloadActiveClinics();
        }
      });

      this.closeRestoreModal();
    }
  }

  /**
   * Reload active clinics data
   */
  private reloadActiveClinics(): void {
    const currentPagination = this.paginationData();
    this.loadActiveClinics(currentPagination?.currentPage || 1, currentPagination?.recordsPerPage || 12);
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    const perPage = this.paginationData()?.recordsPerPage || 12;
    this.loadActiveClinics(page, perPage);
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(size: number): void {
    this.loadActiveClinics(1, size);
  }

  /**
   * Track by function para ngFor
   */
  trackByClinicId(index: number, clinic: Clinic): string {
    return clinic?.id || index.toString();
  }
}
