import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableModalComponent } from '../../../../shared/components/reusable-modal/reusable-modal.component';
import { InvoicePreviewData } from '../invoice-preview.component';

export interface InvoiceToGenerate extends InvoicePreviewData {}

/**
 * Componente modal para generación masiva de facturas
 * Muestra una tabla con las facturas a generar y permite editar fechas
 */
@Component({
  selector: 'app-bulk-invoice-modal',
  standalone: true,
  imports: [CommonModule, ReusableModalComponent],
  templateUrl: './bulk-invoice-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkInvoiceModalComponent {
  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) invoicesToGenerate!: InvoiceToGenerate[];
  @Input({ required: true }) errorMessage!: string | null;
  @Input({ required: true }) totalSelectedAmount!: number;

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() closeError = new EventEmitter<void>();
  @Output() updateDate = new EventEmitter<{ dni: string; date: string }>();
  @Output() preview = new EventEmitter<string>();

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
   * Maneja el cambio de fecha de una factura
   */
  onDateChange(dni: string, event: Event) {
    const date = (event.target as HTMLInputElement).value;
    this.updateDate.emit({ dni, date });
  }

  /**
   * Maneja la vista previa de una factura
   */
  onPreview(dni: string) {
    this.preview.emit(dni);
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
