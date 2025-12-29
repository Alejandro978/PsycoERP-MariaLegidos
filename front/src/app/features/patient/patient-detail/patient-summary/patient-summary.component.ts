import {
  Component,
  ChangeDetectionStrategy,
  Input,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';import { Session, Invoice, Bonus } from '../../../../shared/models/patient-detail.model';
import { Patient } from '../../../../shared/models/patient.model';

/**
 * Patient Summary Component
 *
 * Displays summary information for a patient including:
 * - Basic patient data
 * - Session statistics
 * - Session history
 * - Billing information
 */
@Component({
  selector: 'app-patient-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientSummaryComponent {
  @Input() patient!: Patient;
  @Input() sessions: Session[] = [];
  @Input() invoices: Invoice[] = [];
  @Input() bonuses: Bonus[] = [];
  @Input() sessionStats = { completed: 0, scheduled: 0, cancelled: 0 };
  @Input() billingInfo = { totalSpent: 0, invoicesIssued: 0 };
  @Input() sessionType = 'Presencial';


  readonly completedSessions = computed(() => this.sessionStats.completed);

  readonly scheduledSessions = computed(() => this.sessionStats.scheduled);

  readonly cancelledSessions = computed(() => this.sessionStats.cancelled);

  readonly totalSpent = computed(() => this.billingInfo.totalSpent);

  readonly recentSessions = computed(() => this.sessions.slice(0, 10));

  getFullName(patient: Patient): string {
    return `${patient.first_name} ${patient.last_name}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString("es-ES");
  }

  getSessionTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'online':
        return 'bg-blue-100 text-blue-800';
      case 'presencial':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
}