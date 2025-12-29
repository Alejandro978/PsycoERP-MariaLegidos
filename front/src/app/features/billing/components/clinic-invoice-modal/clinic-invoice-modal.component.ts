import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableModalComponent } from '../../../../shared/components/reusable-modal/reusable-modal.component';
import { User } from '../../../../core/models/user.model';

export interface SessionsByPrice {
  unit_price: number;
  sessions_count: number;
  total_net: number;
}

export interface ClinicInvoiceToGenerate {
  clinic_id: number;
  clinic_name: string;
  total_sessions: number;
  sessions_data: SessionsByPrice[];
  total_net: number;
  total_net_with_irpf: number;
  invoice_number: string;
  invoice_date: string;
}

/**
 * Componente modal para generación de factura de clínica
 * Muestra una tabla con los datos de la factura a generar
 */
@Component({
  selector: 'app-clinic-invoice-modal',
  standalone: true,
  imports: [CommonModule, ReusableModalComponent],
  templateUrl: './clinic-invoice-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicInvoiceModalComponent {
  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) clinicInvoiceToGenerate!: ClinicInvoiceToGenerate | null;
  @Input({ required: true }) errorMessage!: string | null;
  @Input({ required: true }) userData!: User | null;

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() closeError = new EventEmitter<void>();
  @Output() updateDate = new EventEmitter<string>();
  @Output() preview = new EventEmitter<void>();

  /**
   * Formatea un número como moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  /**
   * Maneja el cambio de fecha de la factura
   */
  onDateChange(event: Event) {
    const date = (event.target as HTMLInputElement).value;
    this.updateDate.emit(date);
  }

  /**
   * Maneja la vista previa de la factura
   */
  onPreview() {
    this.preview.emit();
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit() {
    this.submit.emit();
  }

  /**
   * Maneja la cancelación del modal
   */
  onCancel() {
    this.cancel.emit();
  }

  /**
   * Cierra el mensaje de error
   */
  onCloseError() {
    this.closeError.emit();
  }
}
