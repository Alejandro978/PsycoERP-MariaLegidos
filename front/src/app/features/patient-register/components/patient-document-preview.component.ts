import { Component, Input, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('documentContent') documentContent!: ElementRef<HTMLDivElement>;

  /**
   * Genera y descarga el documento como PDF
   */
  async generatePDF(): Promise<void> {
    if (!this.documentContent?.nativeElement) {
      console.error('No se encontró el contenido del documento');
      return;
    }

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
      const fileName = `consentimiento_${patientName}_${patientLastName}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Descargar
      pdf.save(fileName.toLowerCase().replace(/\s+/g, '_'));
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }
}
