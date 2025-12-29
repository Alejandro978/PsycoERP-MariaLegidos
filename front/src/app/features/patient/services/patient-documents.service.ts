import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';
import { PatientDocument } from '../../../shared/models/patient-detail.model';

export interface UploadDocumentRequest {
  patient_id: number;
  description: string;
  file: File;
}

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: PatientDocument;
}

@Injectable({ providedIn: 'root' })
export class PatientDocumentsService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private loadingService = inject(LoadingService);

  private readonly apiUrl = `${environment.api.baseUrl}/documents`;

  /**
   * Upload a document for a patient
   *
   * @param request - Contains patient_id, description, and the file to upload
   * @returns Promise with the uploaded document data
   */
  async uploadDocument(request: UploadDocumentRequest): Promise<PatientDocument | null> {
    try {
      this.loadingService.show();

      // Create FormData to send file
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('description', request.description);
      formData.append('patient_id', request.patient_id.toString());

      const response = await lastValueFrom(
        this.http.post<UploadDocumentResponse>(
          `${this.apiUrl}`,
          formData
        )
      );

      this.toast.showSuccess('Documento subido correctamente');
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      this.toast.showError('Error al subir el documento');
      return null;
    } finally {
      this.loadingService.hide();
    }
  }

  /**
   * Delete a document
   *
   * @param documentId - ID of the document to delete
   * @returns Promise with success status
   */
  async deleteDocument(documentId: number): Promise<boolean> {
    try {
      this.loadingService.show();

      await lastValueFrom(
        this.http.delete(
          `${this.apiUrl}/${documentId}`
        )
      );

      this.toast.showSuccess('Documento eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      this.toast.showError('Error al eliminar el documento');
      return false;
    } finally {
      this.loadingService.hide();
    }
  }

  /**
   * Download a document
   *
   * @param patientId - ID of the patient
   * @param documentId - ID of the document to download
   * @param fileName - Name of the file for download
   */
  async downloadDocument(patientId: number, documentId: number, fileName: string): Promise<void> {
    try {
      this.loadingService.show();

      const response = await lastValueFrom(
        this.http.get(
          `${this.apiUrl}/${documentId}/download`,
          { responseType: 'blob' }
        )
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response], { type: response.type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);

      this.toast.showSuccess('Documento descargado correctamente');
    } catch (error) {
      console.error('Error downloading document:', error);
      this.toast.showError('Error al descargar el documento');
    } finally {
      this.loadingService.hide();
    }
  }
}
