import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user.model';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { InvoiceTemplateComponent } from './invoice-template.component';

export interface InvoicePreviewData {
  patient_full_name: string;
  dni: string;
  email: string;
  pending_sessions_count: number;
  total_gross: number;
  invoice_number: string;
  invoice_date: string;
  sessions?: { session_id: number; session_date: string; price: number; }[];
}

@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  imports: [CommonModule, InvoiceTemplateComponent],
  templateUrl: './invoice-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoicePreviewComponent {
  private pdfGenerator = inject(PdfGeneratorService);

  @Input() isOpen: boolean = false;
  @Input() invoiceData: InvoicePreviewData | null = null;
  @Input() userData: User | null = null;

  @Output() onClose = new EventEmitter<void>();
  @Output() onPrint = new EventEmitter<void>();
  @Output() onDownload = new EventEmitter<void>();

  /**
   * Formatea un número como moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  /**
   * Cierra el modal
   */
  close() {
    this.onClose.emit();
  }

  /**
   * Imprime la factura
   */
  print() {
    this.onPrint.emit();
  }

  /**
   * Descarga el PDF
   */
  async download() {
    if (!this.invoiceData) return;

    try {
      // Crear nombre de archivo descriptivo: "FACTURA-FAC-2025-0020-Juan_Perez"
      const patientName = this.invoiceData.patient_full_name
        .replace(/\s+/g, '_')  // Reemplazar espacios por guiones bajos
        .normalize('NFD')       // Normalizar caracteres acentuados
        .replace(/[\u0300-\u036f]/g, ''); // Eliminar acentos

      const fileName = `FACTURA-${this.invoiceData.invoice_number}-${patientName}`;

      await this.pdfGenerator.generatePdfById(
        'invoice-content',
        fileName
      );
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  }
}
