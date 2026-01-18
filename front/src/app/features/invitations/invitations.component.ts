import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitationService } from './services/invitation.service';
import { Invitation, InvitationFilters } from './models/invitation.model';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationsComponent implements OnInit {
  private invitationService = inject(InvitationService);
  private toast = inject(ToastService);

  // State signals
  invitations = signal<Invitation[]>([]);
  totalInvitations = signal(0);
  loading = signal(false);

  // Delete modal state
  deletingInvitation = signal<Invitation | null>(null);

  // Expose Math for template
  Math = Math;

  // Filters
  filters: InvitationFilters = {
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    page: 1,
    limit: 10,
  };

  // Pagination
  pagination = signal({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.loadInvitations();
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

  // Generate new invitation
  generateInvitation(): void {
    this.loading.set(true);
    this.invitationService.generateInvitation().subscribe({
      next: (response) => {
        // Copy link to clipboard
        navigator.clipboard.writeText(response.invitationLink).then(() => {
          this.toast.showSuccess('Enlace copiado al portapapeles');
        }).catch(() => {
          this.toast.showError('Error al copiar el enlace');
        });

        // Reload list to show new invitation
        this.loadInvitations();
      },
      error: (error) => {
        console.error('Error generating invitation:', error);
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
