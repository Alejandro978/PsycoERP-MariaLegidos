import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-card',
  standalone: true,
  templateUrl: './patient-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class PatientCardComponent {
  @Input({ required: true }) patient!: Patient;
  @Input() isDeletedView: boolean = false;

  @Output() onEdit = new EventEmitter<Patient>();
  @Output() onDelete = new EventEmitter<Patient>();
  @Output() onRestore = new EventEmitter<Patient>();
  @Output() onViewDetail = new EventEmitter<Patient>();

  /**
   * Get status color for badge
   */
  getStatusColor(status?: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'fin del tratamiento':
        return 'bg-blue-100 text-blue-800';
      case 'en pausa':
        return 'bg-yellow-100 text-yellow-800';
      case 'abandono':
        return 'bg-red-100 text-red-800';
      case 'derivación':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get status label in Spanish
   */
  getStatusLabel(status?: string): string {
    if (!status) return 'Sin estado';
    switch (status) {
      case 'fin del tratamiento':
        return 'Fin del tratamiento';
      case 'en pausa':
        return 'En pausa';
      case 'abandono':
        return 'Abandono';
      case 'derivación':
        return 'Derivación';
      default:
        return status;
    }
  }

  /**
   * Get patient full name
   */
  get patientFullName(): string {
    return `${this.patient.first_name} ${this.patient.last_name}`;
  }

  /**
   * Calculate patient age
   */
  get patientAge(): number {
    if (!this.patient.birth_date) return 0;
    const birthDate = new Date(this.patient.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Format date for display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Capitalize session type
   */
  capitalizeSessionType(sessionType?: string): string {
    if (!sessionType) return 'N/A';
    const typeMap: { [key: string]: string } = {
      'individual': 'Individual',
      'couples': 'Pareja',
      'family': 'Familiar',
      'group': 'Grupo'
    };
    return typeMap[sessionType] || sessionType;
  }
}
