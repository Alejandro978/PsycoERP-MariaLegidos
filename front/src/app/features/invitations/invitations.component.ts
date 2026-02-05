import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InvitationService } from './services/invitation.service';
import { Invitation, InvitationFilters } from './models/invitation.model';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { ClinicsService } from '../clinics/services/clinics.service';
import { Clinic } from '../clinics/models/clinic.model';
import { ClinicSelectorComponent } from '../../shared/components/clinic-selector/clinic-selector.component';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmationModalComponent, ClinicSelectorComponent],
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationsComponent implements OnInit {
  private invitationService = inject(InvitationService);
  private clinicsService = inject(ClinicsService);
  private toast = inject(ToastService);

  // State signals
  invitations = signal<Invitation[]>([]);
  totalInvitations = signal(0);
  loading = signal(false);

  // Delete modal state
  deletingInvitation = signal<Invitation | null>(null);

  // Clinic selector state
  showClinicSelector = signal(false);
  clinics = signal<Clinic[]>([]);
  clinicControl = new FormControl<string | number | null>(null);

  // Computed: clínicas filtradas (solo is_external = false)
  filteredClinics = computed(() => {
    return this.clinics().filter(clinic => !clinic.is_external);
  });

  // Expose Math for template
  Math = Math;

  // Filters
  filters: InvitationFilters = {
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    page: 1,
    limit: 5,
  };

  // Pagination
  pagination = signal({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.loadInvitations();
    this.loadClinics();
  }

  loadClinics(): void {
    this.clinicsService.getAll().subscribe({
      next: (clinics) => {
        this.clinics.set(clinics);
      },
      error: (error) => {
        console.error('Error loading clinics:', error);
      },
    });
  }

  loadInvitations(): void {
    this.loading.set(true);
    this.invitationService.getInvitations(this.filters).subscribe({
      next: (response) => {
        this.invitations.set(response.data);
        this.pagination.set(response.pagination);
        this.totalInvitations.set(response.pagination.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading invitations:', error);
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.filters.page = 1;
    this.loadInvitations();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      used: 'Usado',
      expired: 'Expirado',
    };
    return labels[status] || status;
  }

  previousPage(): void {
    const currentPage = this.pagination().page;
    if (currentPage > 1) {
      this.filters.page = currentPage - 1;
      this.loadInvitations();
    }
  }

  nextPage(): void {
    const pag = this.pagination();
    if (pag.page < pag.totalPages) {
      this.filters.page = pag.page + 1;
      this.loadInvitations();
    }
  }

  trackByInvitationId(index: number, invitation: Invitation): number {
    return invitation?.id || index;
  }

  // Open clinic selector modal
  openClinicSelector(): void {
    this.clinicControl.setValue(null);
    this.showClinicSelector.set(true);
  }

  // Close clinic selector modal
  closeClinicSelector(): void {
    this.showClinicSelector.set(false);
    this.clinicControl.setValue(null);
  }

  // Handle clinic selection from the selector
  onClinicSelected(): void {
    const clinicId = this.clinicControl.value;
    if (clinicId) {
      this.showClinicSelector.set(false);
      this.generateInvitation(Number(clinicId));
    }
  }

  // Generate new invitation with clinic_id
  generateInvitation(clinicId: number): void {
    this.loading.set(true);
    this.invitationService.generateInvitation(clinicId).subscribe({
      next: () => {
        this.toast.showSuccess('Invitación creada correctamente');
        // Reload list to show new invitation
        this.loadInvitations();
      },
      error: (error) => {
        console.error('Error generating invitation:', error);
        this.toast.showError('Error al crear la invitación');
        this.loading.set(false);
      },
    });
  }

  // Copy invitation link to clipboard
  copyInvitationLink(token: string): void {
    const link = `${window.location.origin}/register/${token}`;

    navigator.clipboard.writeText(link).then(() => {
      this.toast.showSuccess('Enlace copiado al portapapeles');
    }).catch((error) => {
      console.error('Error copying link:', error);
      this.toast.showError('Error al copiar el enlace');
    });
  }

  // Open delete confirmation modal
  openDeleteModal(invitation: Invitation): void {
    this.deletingInvitation.set(invitation);
  }

  // Close delete modal
  closeDeleteModal(): void {
    this.deletingInvitation.set(null);
  }

  // Handle delete confirmation
  handleDeleteInvitation(): void {
    const invitation = this.deletingInvitation();
    if (invitation) {
      this.invitationService.deleteInvitation(invitation.id).subscribe({
        next: () => {
          this.loadInvitations();
        },
        error: (error) => {
          console.error('Error deleting invitation:', error);
        },
      });
      this.closeDeleteModal();
    }
  }
}
