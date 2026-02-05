import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from './services/notes.service';
import { NoteCardComponent } from './components/note-card/note-card.component';
import { NoteDialogComponent } from './components/note-dialog/note-dialog.component';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { Note } from './models/note.model';
import { ToastService } from '../../core/services/toast.service';

/**
 * Notes management component
 * Displays notes with KPIs, pagination, and CRUD operations
 */
@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    NoteCardComponent,
    NoteDialogComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesComponent implements OnInit {
  private toastService = inject(ToastService);
  public notesService = inject(NotesService);

  // Dialog states
  isDialogOpen = false;
  showDeleteConfirmation = false;
  noteToDelete: Note | null = null;

  ngOnInit(): void {
    this.loadNotes();
  }

  /**
   * Load notes from API
   */
  private loadNotes(): void {
    this.notesService.loadNotes().subscribe();
  }

  /**
   * Open create note dialog
   */
  openDialog(): void {
    this.isDialogOpen = true;
  }

  /**
   * Close create note dialog
   */
  closeDialog(): void {
    this.isDialogOpen = false;
  }

  /**
   * Handle create note from dialog
   */
  handleCreateNote(message: string): void {
    this.notesService.createNote({ message }).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Nota creada correctamente');
          this.closeDialog();
        } else {
          this.toastService.showError(response.message || 'Error al crear la nota');
        }
      }
    });
  }

  /**
   * Handle complete note (only pending -> completed)
   */
  handleCompleteNote(note: Note): void {
    if (note.status === 'pending') {
      this.notesService.completeNote(note.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Nota completada');
          } else {
            this.toastService.showError(response.message || 'Error al completar la nota');
          }
        }
      });
    }
  }

  /**
   * Request delete confirmation
   */
  handleDeleteNote(note: Note): void {
    this.noteToDelete = note;
    this.showDeleteConfirmation = true;
  }

  /**
   * Confirm delete note
   */
  confirmDeleteNote(): void {
    if (this.noteToDelete) {
      this.notesService.deleteNote(this.noteToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Nota eliminada correctamente');
          } else {
            this.toastService.showError(response.message || 'Error al eliminar la nota');
          }
        }
      });
    }
    this.cancelDeleteNote();
  }

  /**
   * Cancel delete operation
   */
  cancelDeleteNote(): void {
    this.showDeleteConfirmation = false;
    this.noteToDelete = null;
  }

  /**
   * Handle page change
   */
  goToPage(page: number): void {
    this.notesService.goToPage(page);
  }

  /**
   * Go to previous page
   */
  prevPage(): void {
    this.notesService.prevPage();
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    this.notesService.nextPage();
  }

  /**
   * Generate page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pagination = this.notesService.pagination();
    const total = pagination.total_pages;
    const current = pagination.current_page;
    const pages: number[] = [];

    if (total === 0) return [];

    // Show max 5 pages
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
