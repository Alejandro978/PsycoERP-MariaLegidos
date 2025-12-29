import { PatientMedicalRecord } from './patient-detail.model';

export interface CreateClinicalNoteDto {
  patient_id: number;
  title: string;
  content: string;
}

export interface UpdateClinicalNoteDto {
  id: number;
  title: string;
  content: string;
}

export interface ClinicalNoteResponse {
  success: boolean;
  message: string;
  data?: PatientMedicalRecord;
}
