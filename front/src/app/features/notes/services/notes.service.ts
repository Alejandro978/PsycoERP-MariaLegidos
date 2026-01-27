import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import {
  Note,
  NotesKPIs,
  NotesPagination,
  NotesApiResponse,
  NoteApiResponse,
  CreateNoteRequest
} from '../models/note.model';
import { environment } from '../../../../environments/environment';

/**
 * Service for managing notes with API integration
 * Uses Angular Signals for reactive state management
 */
@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}/notes`;

  // State signals
  private notesState = signal<Note[]>([]);
  private kpisState = signal<NotesKPIs>({
    total_notes: 0,
    pending_notes: 0,
    completed_notes: 0
  });
  private paginationState = signal<NotesPagination>({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    records_per_page: 5,
    has_next_page: false,
    has_previous_page: false
  });
  private loadingState = signal(false);
  private errorState = signal<string | null>(null);

  // Public readonly signals
  public notes = computed(() => this.notesState());
  public kpis = computed(() => this.kpisState());
  public pagination = computed(() => this.paginationState());
  public isLoading = computed(() => this.loadingState());
  public error = computed(() => this.errorState());

  /**
   * Load notes from API with pagination
   * @param page Page number (default: 1)
   * @param limit Records per page (default: 5)
   */
  loadNotes(page: number = 1, limit: number = 5): Observable<NotesApiResponse> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.get<NotesApiResponse>(`${this.baseUrl}?page=${page}&limit=${limit}`).pipe(
      tap(response => {
        if (response.success) {
          this.notesState.set(response.data);
          this.kpisState.set(response.kpis);
          this.paginationState.set(response.pagination);
        }
        this.loadingState.set(false);
      }),
      catchError(error => {
        console.error('Error loading notes:', error);
        this.errorState.set('Error al cargar las notas');
        this.loadingState.set(false);
        return of({
          success: false,
          kpis: this.kpisState(),
          pagination: this.paginationState(),
          data: []
        } as NotesApiResponse);
      })
    );
  }

  /**
   * Create a new note
   * @param request Note creation request with message
   */
  createNote(request: CreateNoteRequest): Observable<NoteApiResponse> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<NoteApiResponse>(this.baseUrl, request).pipe(
      tap(response => {
        this.loadingState.set(false);
        // Reload notes to get updated KPIs and list
        if (response.success) {
          this.loadNotes(this.paginationState().current_page, this.paginationState().records_per_page).subscribe();
        }
      }),
      catchError(error => {
        console.error('Error creating note:', error);
        this.errorState.set('Error al crear la nota');
        this.loadingState.set(false);
        return of({ success: false, message: 'Error al crear la nota' });
      })
    );
  }

  /**
   * Mark a note as completed
   * @param noteId Note ID to complete
   */
  completeNote(noteId: number): Observable<NoteApiResponse> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.patch<NoteApiResponse>(`${this.baseUrl}/${noteId}/complete`, {}).pipe(
      tap(response => {
        this.loadingState.set(false);
        // Reload notes to get updated KPIs and list
        if (response.success) {
          this.loadNotes(this.paginationState().current_page, this.paginationState().records_per_page).subscribe();
        }
      }),
      catchError(error => {
        console.error('Error completing note:', error);
        this.errorState.set('Error al completar la nota');
        this.loadingState.set(false);
        return of({ success: false, message: 'Error al completar la nota' });
      })
    );
  }

  /**
   * Delete a note
   * @param noteId Note ID to delete
   */
  deleteNote(noteId: number): Observable<NoteApiResponse> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.delete<NoteApiResponse>(`${this.baseUrl}/${noteId}`).pipe(
      tap(response => {
        this.loadingState.set(false);
        // Reload notes to get updated KPIs and list
        if (response.success) {
          // If we deleted the last item on the page, go to previous page
          const pagination = this.paginationState();
          const notes = this.notesState();
          let targetPage = pagination.current_page;

          if (notes.length === 1 && pagination.has_previous_page) {
            targetPage = pagination.current_page - 1;
          }

          this.loadNotes(targetPage, pagination.records_per_page).subscribe();
        }
      }),
      catchError(error => {
        console.error('Error deleting note:', error);
        this.errorState.set('Error al eliminar la nota');
        this.loadingState.set(false);
        return of({ success: false, message: 'Error al eliminar la nota' });
      })
    );
  }

  /**
   * Navigate to a specific page
   * @param page Target page number
   */
  goToPage(page: number): void {
    const pagination = this.paginationState();
    if (page >= 1 && page <= pagination.total_pages) {
      this.loadNotes(page, pagination.records_per_page).subscribe();
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    const pagination = this.paginationState();
    if (pagination.has_next_page) {
      this.goToPage(pagination.current_page + 1);
    }
  }

  /**
   * Go to previous page
   */
  prevPage(): void {
    const pagination = this.paginationState();
    if (pagination.has_previous_page) {
      this.goToPage(pagination.current_page - 1);
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorState.set(null);
  }
}
