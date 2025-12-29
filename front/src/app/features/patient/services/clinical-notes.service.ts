import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientMedicalRecord } from '../../../shared/models/patient-detail.model';
import { environment } from '../../../../environments/environment';
import { CreateClinicalNoteDto, UpdateClinicalNoteDto, ClinicalNoteResponse } from '../../../shared/models/clinical-note.model';

/**
 * Service for managing clinical notes
 * Handles CRUD operations for patient medical records
 */
@Injectable({
  providedIn: 'root'
})
export class ClinicalNotesService {
  private http = inject(HttpClient);
  private apiUrl = environment.api.baseUrl;

  /**
   * Get all clinical notes for a patient
   */
  getClinicalNotes(patientId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clinical-notes/patient/${patientId}`);
  }

  /**
   * Create a new clinical note
   */
  createClinicalNote(data: CreateClinicalNoteDto): Observable<ClinicalNoteResponse> {
    return this.http.post<ClinicalNoteResponse>(`${this.apiUrl}/clinical-notes`, data);
  }

  /**
   * Update an existing clinical note
   */
  updateClinicalNote(data: UpdateClinicalNoteDto): Observable<ClinicalNoteResponse> {
    return this.http.put<ClinicalNoteResponse>(`${this.apiUrl}/clinical-notes/${data.id}`, {
      title: data.title,
      content: data.content
    });
  }

  /**
   * Delete a clinical note
   */
  deleteClinicalNote(id: number): Observable<ClinicalNoteResponse> {
    return this.http.delete<ClinicalNoteResponse>(`${this.apiUrl}/clinical-notes/${id}`);
  }
}