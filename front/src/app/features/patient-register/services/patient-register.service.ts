import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TokenValidation,
  PatientRegistration,
  RegistrationResponse,
  DocumentUploadResponse,
} from '../models/patient-register.model';

@Injectable({
  providedIn: 'root',
})
export class PatientRegisterService {
  private http = inject(HttpClient);

  private readonly invitationsUrl = '/invitations';
  private readonly patientsUrl = '/patients';
  private readonly documentsUrl = '/documents';

  private get httpOptions() {
    return {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      responseType: 'json' as const,
    };
  }

  validateToken(token: string): Observable<TokenValidation> {
    return this.http.get<TokenValidation>(
      `${this.invitationsUrl}/validate/${token}`,
      this.httpOptions
    );
  }

  registerPatient(
    token: string,
    data: PatientRegistration
  ): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      `${this.patientsUrl}/register/${token}`,
      data,
      this.httpOptions
    );
  }

  /**
   * Sube un documento PDF al servidor
   * @param patientId ID del paciente
   * @param pdfBlob Blob del PDF a subir
   * @param fileName Nombre del archivo
   * @param description Descripción del documento
   */
  uploadDocument(
    patientId: number,
    pdfBlob: Blob,
    fileName: string,
    description: string
  ): Observable<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('patient_id', patientId.toString());
    formData.append('description', description);
    formData.append('file', pdfBlob, fileName);

    // No establecer Content-Type, el navegador lo hace automáticamente con boundary
    // POST /api/documents (sin /upload)
    return this.http.post<DocumentUploadResponse>(
      this.documentsUrl,
      formData
    );
  }
}
