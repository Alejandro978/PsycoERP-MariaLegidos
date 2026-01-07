import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from './services/notes.service';
import { NoteCardComponent } from './components/note-card/note-card.component';
import { NoteDialogComponent } from './components/note-dialog/note-dialog.component';
import { Note } from './models/note.model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, NoteCardComponent, NoteDialogComponent],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent {
  isDialogOpen = signal(false);

  constructor(public notesService: NotesService) {}

  get kpis() {
    return this.notesService.kpis();
  }

  get notes() {
    return this.notesService.notes();
  }

  openDialog(): void {
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
  }

  handleCreateNote(message: string): void {
    this.notesService.createNote({ message });
    this.closeDialog();
  }

  handleToggleStatus(note: Note): void {
    this.notesService.toggleNoteStatus(note.id);
  }

  handleDeleteNote(note: Note): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      this.notesService.deleteNote(note.id);
    }
  }
}
