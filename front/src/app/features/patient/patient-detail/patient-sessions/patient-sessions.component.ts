import {
  Component,
  ChangeDetectionStrategy,
  Input,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientSession } from '../../../../shared/models/patient-detail.model';
import { Patient } from '../../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-sessions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientSessionsComponent {
  @Input({ required: true }) patient!: Patient;
  @Input({ required: true }) sessions: PatientSession[] = [];

  readonly statusFilter = signal('all');
  readonly paymentMethodFilter = signal('all');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  readonly paymentMethods = ['bizum', 'transferencia', 'tarjeta', 'efectivo', 'pendiente'];

  readonly filteredSessions = computed(() => {
    let filtered = [...this.sessions];

    // Filter by status
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(session => session.estado === this.statusFilter());
    }

    // Filter by payment method
    if (this.paymentMethodFilter() !== 'all') {
      filtered = filtered.filter(session => session.tipo_pago === this.paymentMethodFilter());
    }

    // Filter by date range
    if (this.dateFrom()) {
      const fromDate = new Date(this.dateFrom());
      filtered = filtered.filter(session => new Date(session.fecha) >= fromDate);
    }

    if (this.dateTo()) {
      const toDate = new Date(this.dateTo());
      filtered = filtered.filter(session => new Date(session.fecha) <= toDate);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return this.sortOrder() === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  });


  clearFilters(): void {
    this.statusFilter.set('all');
    this.paymentMethodFilter.set('all');
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  toggleSortOrder(): void {
    this.sortOrder.update(current => current === 'asc' ? 'desc' : 'asc');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  }

  getPaymentColor(paymentMethod: string): string {
    switch (paymentMethod.toLowerCase()) {
      case 'bizum':
        return 'bg-purple-100 text-purple-800';
      case 'transferencia':
        return 'bg-blue-100 text-blue-800';
      case 'tarjeta':
        return 'bg-green-100 text-green-800';
      case 'efectivo':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES');
  }

  formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${numPrice.toFixed(2)}€`;
  }
}
