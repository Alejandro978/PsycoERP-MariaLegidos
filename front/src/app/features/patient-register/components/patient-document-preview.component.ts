import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
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
export class PatientDocumentPreviewComponent implements OnInit {
  @Input({ required: true }) registerForm!: FormGroup;
  @Input({ required: true }) isMinor!: boolean;
  @Input({ required: true }) signatures!: Map<string, string>;
  @Input({ required: true }) currentDate!: Date;

  @ViewChild('documentContent') documentContent!: ElementRef<HTMLDivElement>;

  // Logo precargado como data URL para que html2canvas lo renderice sin peticiones externas
  logoDataUrl = '';

  ngOnInit(): void {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      this.logoDataUrl = canvas.toDataURL('image/png');
    };
    img.src = 'assets/logo/logo.png';
  }

  /**
   * Genera el PDF y retorna como Blob para subir al servidor
   * @returns Objeto con el blob del PDF y el nombre del archivo
   */
  async getPdfBlob(): Promise<{ blob: Blob; fileName: string }> {
    if (!this.documentContent?.nativeElement) {
      throw new Error('No se encontró el contenido del documento');
    }

    const element = this.documentContent.nativeElement;

    // En móvil el contenedor padre puede tener clase 'hidden' (display:none) porque
    // el usuario está en el tab del formulario. html2canvas no puede capturar elementos
    // ocultos y devuelve un canvas 0x0, lo que causa "invalid coordinates" en jsPDF.
    // Solución: buscar el ancestro oculto y mostrarlo temporalmente fuera de pantalla.
    let hiddenAncestor: HTMLElement | null = null;
    let parent = element.parentElement;
    while (parent) {
      if (
        parent.classList.contains('hidden') ||
        getComputedStyle(parent).display === 'none'
      ) {
        hiddenAncestor = parent;
        break;
      }
      parent = parent.parentElement;
    }

    if (hiddenAncestor) {
      hiddenAncestor.classList.remove('hidden');
      hiddenAncestor.style.position = 'fixed';
      hiddenAncestor.style.left = '-9999px';
      hiddenAncestor.style.top = '0';
      hiddenAncestor.style.width = '800px';
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 5000,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('El canvas generado tiene dimensiones inválidas');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.8);

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
      const imgX = Math.max(0, (pdfWidth - imgWidth * ratio) / 2);
      const imgY = 0;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const patientName = this.registerForm.get('first_name')?.value || 'paciente';
      const patientLastName = this.registerForm.get('last_name')?.value || '';
      const fileName = `consentimiento_${patientName}_${patientLastName}_${new Date().toISOString().split('T')[0]}.pdf`
        .toLowerCase()
        .replace(/\s+/g, '_');

      const blob = pdf.output('blob');
      return { blob, fileName };
    } finally {
      // Restaurar siempre el estado original del ancestro
      if (hiddenAncestor) {
        hiddenAncestor.classList.add('hidden');
        hiddenAncestor.style.position = '';
        hiddenAncestor.style.left = '';
        hiddenAncestor.style.top = '';
        hiddenAncestor.style.width = '';
      }
    }
  }
}
