import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-patient-document-preview',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './patient-document-preview.component.html',
  styleUrls: ['./patient-document-preview.component.scss'],
})
export class PatientDocumentPreviewComponent {
  @Input({ required: true }) registerForm!: FormGroup;
  @Input({ required: true }) isMinor!: boolean;
  @Input({ required: true }) signatures!: Map<string, string>;
  @Input({ required: true }) currentDate!: Date;
  @Input() canDownload: boolean = false;

  @Output() pdfDownloaded = new EventEmitter<void>();

  @ViewChild('documentContent') documentContent!: ElementRef<HTMLDivElement>;

  isGenerating = signal(false);
  downloadError = signal('');

  /**
   * Genera y descarga el documento como PDF
   */
  async generatePDF(): Promise<void> {
    if (!this.documentContent?.nativeElement) {
      console.error('No se encontró el contenido del documento');
      return;
    }

    this.isGenerating.set(true);
    this.downloadError.set('');

    const element = this.documentContent.nativeElement;

    try {
      // Capturar el elemento como canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Generar nombre del archivo
      const patientName = this.registerForm.get('first_name')?.value || 'paciente';
      const patientLastName = this.registerForm.get('last_name')?.value || '';
      const fileName = `consentimiento_${patientName}_${patientLastName}_${new Date().toISOString().split('T')[0]}.pdf`.toLowerCase().replace(/\s+/g, '_');

      // Detectar si es móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // En móvil: abrir en nueva pestaña para mejor compatibilidad
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');

        // Limpiar URL después de un tiempo
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
      } else {
        // En desktop: descarga directa
        pdf.save(fileName);
      }

      // Emitir evento de descarga exitosa
      this.pdfDownloaded.emit();
      this.isGenerating.set(false);
    } catch (error) {
      console.error('Error generando PDF:', error);
      this.downloadError.set('Error al generar el documento. Intenta de nuevo.');
      this.isGenerating.set(false);
      throw error;
    }
  }
}
