/**
 * Status type for notes
 */
export type NoteStatus = 'pending' | 'completed';

/**
 * Note entity matching API response
 */
export interface Note {
  id: number;
  message: string;
  status: NoteStatus;
  created_at: string; // Format: "YYYY-MM-DD HH:mm:ss"
  updated_at: string; // Format: "YYYY-MM-DD HH:mm:ss"
}

/**
 * KPIs for notes dashboard
 */
export interface NotesKPIs {
  total_notes: number;
  pending_notes: number;
  completed_notes: number;
}

/**
 * Pagination info from API (snake_case to match API response)
 */
export interface NotesPagination {
  current_page: number;
  total_pages: number;
  total_records: number;
  records_per_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

/**
 * API response for GET /notes
 */
export interface NotesApiResponse {
  success: boolean;
  kpis: NotesKPIs;
  pagination: NotesPagination;
  data: Note[];
}

/**
 * API response for single operations (create, update, delete)
 */
export interface NoteApiResponse {
  success: boolean;
  message?: string;
  data?: Note;
}

/**
 * Request body for creating a note
 */
export interface CreateNoteRequest {
  message: string;
}
