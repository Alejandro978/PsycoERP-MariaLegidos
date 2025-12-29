export interface ClinicalNote {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  sessionId?: string;
  createdBy: string;
  updatedAt?: Date;
}

export interface CreateClinicalNoteRequest {
  title: string;
  content: string;
  tags: string[];
  patientId: string;
  sessionId?: string;
}

export interface UpdateClinicalNoteRequest {
  title: string;
  content: string;
  tags: string[];
}