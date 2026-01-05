import { Injectable, signal, computed } from '@angular/core';
import { Note, NotesDTO, NotesKPIs, CreateNoteRequest, UpdateNoteRequest } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  // Estado privado con signals
  private notesState = signal<Note[]>([]);

  // Signals públicos computados
  public notes = computed(() => this.notesState());

  public kpis = computed<NotesKPIs>(() => {
    const notes = this.notesState();
    return {
      total_notes: notes.length,
      pending_notes: notes.filter(n => n.status === 'pending').length,
      completed_notes: notes.filter(n => n.status === 'completed').length
    };
  });

  constructor() {
    // Cargar datos mock iniciales
    this.loadMockData();
  }

  /**
   * Cargar datos mock (temporal hasta conectar con API)
   */
  private loadMockData(): void {
    const mockNotes: Note[] = [
      {
        id: '1',
        creation_date: new Date().toISOString(),
        message: 'Revisar documentación de paciente María García antes de la próxima sesión',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        creation_date: new Date(Date.now() - 86400000).toISOString(), // Ayer
        message: 'Confirmar cita con paciente Carlos Ruiz para el viernes',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        creation_date: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
        message: 'Preparar informe mensual de pacientes activos',
        status: 'pending',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '4',
        creation_date: new Date(Date.now() - 259200000).toISOString(), // Hace 3 días
        message: 'Actualizar horarios de disponibilidad en el sistema',
        status: 'completed',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    this.notesState.set(mockNotes);
  }

  /**
   * Obtener todas las notas
   */
  getAllNotes(): Note[] {
    return this.notesState();
  }

  /**
   * Crear una nueva nota
   */
  createNote(request: CreateNoteRequest): Note {
    const newNote: Note = {
      id: Date.now().toString(),
      creation_date: new Date().toISOString(),
      message: request.message,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.notesState.update(notes => [newNote, ...notes]);
    return newNote;
  }

  /**
   * Actualizar una nota
   */
  updateNote(request: UpdateNoteRequest): Note | null {
    const notes = this.notesState();
    const noteIndex = notes.findIndex(n => n.id === request.id);

    if (noteIndex === -1) return null;

    const updatedNote: Note = {
      ...notes[noteIndex],
      ...request,
      updated_at: new Date().toISOString()
    };

    this.notesState.update(notes => {
      const newNotes = [...notes];
      newNotes[noteIndex] = updatedNote;
      return newNotes;
    });

    return updatedNote;
  }

  /**
   * Cambiar estado de una nota
   */
  toggleNoteStatus(noteId: string): Note | null {
    const notes = this.notesState();
    const note = notes.find(n => n.id === noteId);

    if (!note) return null;

    return this.updateNote({
      id: noteId,
      status: note.status === 'completed' ? 'pending' : 'completed'
    });
  }

  /**
   * Eliminar una nota
   */
  deleteNote(noteId: string): boolean {
    const notes = this.notesState();
    const noteIndex = notes.findIndex(n => n.id === noteId);

    if (noteIndex === -1) return false;

    this.notesState.update(notes => notes.filter(n => n.id !== noteId));
    return true;
  }

  /**
   * Obtener DTO completo (para compatibilidad con el formato esperado)
   */
  getNotesDTO(): NotesDTO {
    return {
      kpis: this.kpis(),
      notes: this.notes()
    };
  }
}
