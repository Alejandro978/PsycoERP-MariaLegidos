import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  /**
   * Genera y descarga un PDF a partir de un elemento HTML
   * @param element Elemento HTML a convertir en PDF
   * @param fileName Nombre del archivo PDF a descargar
   */
  async generatePdfFromElement(element: HTMLElement, fileName: string): Promise<void> {
    try {
      // Convertir el HTML a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Mayor calidad
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Obtener dimensiones para A4
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Agregar la imagen al PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Descargar el PDF
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }

  /**
   * Genera y descarga un PDF a partir de un ID de elemento
   * @param elementId ID del elemento HTML
   * @param fileName Nombre del archivo PDF a descargar
   */
  async generatePdfById(elementId: string, fileName: string): Promise<void> {
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`No se encontró el elemento con ID: ${elementId}`);
    }

    await this.generatePdfFromElement(element, fileName);
  }

  /**
   * Genera un PDF y devuelve el Blob sin descargarlo
   * @param element Elemento HTML a convertir en PDF
   * @returns Promise con el Blob del PDF generado
   */
  async generatePdfBlob(element: HTMLElement): Promise<Blob> {
    try {
      // Convertir el HTML a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Mayor calidad
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Obtener dimensiones para A4
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Agregar la imagen al PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Retornar como Blob
      return pdf.output('blob');
    } catch (error) {
      console.error('Error generando PDF Blob:', error);
      throw error;
    }
  }

  /**
   * Genera múltiples PDFs y los descarga en un archivo ZIP
   * @param elements Array de elementos HTML con sus nombres de archivo
   * @param zipFileName Nombre del archivo ZIP a descargar
   * @param onProgress Callback opcional para reportar progreso
   */
  async generateBulkPdfsAsZip(
    elements: Array<{ element: HTMLElement; fileName: string }>,
    zipFileName: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    try {
      const zip = new JSZip();
      const total = elements.length;

      // Generar PDFs y agregarlos al ZIP
      for (let i = 0; i < elements.length; i++) {
        const { element, fileName } = elements[i];

        // Reportar progreso
        if (onProgress) {
          onProgress(i + 1, total);
        }

        // Generar PDF como Blob
        const pdfBlob = await this.generatePdfBlob(element);

        // Agregar al ZIP con nombre sanitizado
        const sanitizedFileName = `${fileName}.pdf`.replace(/[^a-z0-9_\-\.]/gi, '_');
        zip.file(sanitizedFileName, pdfBlob);
      }

      // Generar el archivo ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${zipFileName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando ZIP de PDFs:', error);
      throw error;
    }
  }
}
