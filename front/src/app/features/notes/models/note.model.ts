export interface Note {
  id: string;
  creation_date: string; // ISO date
  message: string;
  status: 'completed' | 'pending';
  created_at?: string;
  updated_at?: string;
}

export interface NotesKPIs {
  total_notes: number;
  pending_notes: number;
  completed_notes: number;
}

export interface NotesDTO {
  kpis: NotesKPIs;
  notes: Note[];
}

export interface CreateNoteRequest {
  message: string;
}

export interface UpdateNoteRequest {
  id: string;
  message?: string;
  status?: 'completed' | 'pending';
}
