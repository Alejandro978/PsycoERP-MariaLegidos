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
   * Genera el PDF y retorna como Blob para subir al servidor
   * @returns Objeto con el blob del PDF y el nombre del archivo
   */
  async getPdfBlob(): Promise<{ blob: Blob; fileName: string }> {
    if (!this.documentContent?.nativeElement) {
      throw new Error('No se encontró el contenido del documento');
    }

    const element = this.documentContent.nativeElement;

    // Capturar el elemento como canvas con escala reducida para mejor rendimiento
    const canvas = await html2canvas(element, {
      scale: 1.5, // Reducido de 2 a 1.5 para mejor rendimiento
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 5000, // Timeout para imágenes
    });

    // Crear PDF con compresión JPEG en lugar de PNG
    const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG con 80% calidad

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

    // Generar nombre del archivo
    const patientName = this.registerForm.get('first_name')?.value || 'paciente';
    const patientLastName = this.registerForm.get('last_name')?.value || '';
    const fileName = `consentimiento_${patientName}_${patientLastName}_${new Date().toISOString().split('T')[0]}.pdf`
      .toLowerCase()
      .replace(/\s+/g, '_');

    // Retornar blob y nombre
    const blob = pdf.output('blob');
    return { blob, fileName };
  }
}
