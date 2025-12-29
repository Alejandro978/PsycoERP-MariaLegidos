import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Clinic } from '../../models/clinic.model';

@Component({
  selector: 'app-clinic-card',
  standalone: true,
  templateUrl: './clinic-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ClinicCardComponent {
  @Input({ required: true }) clinic!: Clinic;
  @Input() isDeletedView: boolean = false;

  @Output() onEdit = new EventEmitter<Clinic>();
  @Output() onDelete = new EventEmitter<Clinic>();
  @Output() onRestore = new EventEmitter<Clinic>();

  /**
   * Get darker border color based on clinic color
   */
  getBorderColor(clinicColor: string): string {
    // Convert hex to RGB and darken it
    const hex = clinicColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken by reducing RGB values
    const darkerR = Math.max(0, r - 40);
    const darkerG = Math.max(0, g - 40);
    const darkerB = Math.max(0, b - 40);

    return `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
  }

  /**
   * Get background gradient based on clinic color
   */
  getBackgroundStyle(clinicColor: string): string {
    // Convert hex to RGB for gradient
    const hex = clinicColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.082) 0%, rgba(${r}, ${g}, ${b}, 0.145) 100%)`;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  }
}