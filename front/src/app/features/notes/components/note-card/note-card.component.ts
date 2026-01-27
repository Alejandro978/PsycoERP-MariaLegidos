import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';

/**
 * Note card component for displaying individual notes
 * Supports complete and delete actions
 */
@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './note-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteCardComponent {
  @Input({ required: true }) note!: Note;
  @Output() onComplete = new EventEmitter<Note>();
  @Output() onDelete = new EventEmitter<Note>();

  showMenu = false;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  closeMenu(): void {
    this.showMenu = false;
  }

  handleComplete(): void {
    if (this.note.status === 'pending') {
      this.onComplete.emit(this.note);
    }
    this.closeMenu();
  }

  handleDelete(): void {
    this.onDelete.emit(this.note);
    this.closeMenu();
  }

  /**
   * Format date string from API format to readable format
   * @param dateString Date in format "YYYY-MM-DD HH:mm:ss"
   */
  formatDate(dateString: string): string {
    // Parse "YYYY-MM-DD HH:mm:ss" format
    const [datePart] = dateString.split(' ');
    const date = new Date(datePart);
    const now = new Date();

    // Reset time to compare just dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const noteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = today.getTime() - noteDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays > 1 && diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  /**
   * Format time from date string
   * @param dateString Date in format "YYYY-MM-DD HH:mm:ss"
   */
  formatTime(dateString: string): string {
    const parts = dateString.split(' ');
    if (parts.length > 1) {
      // Return just HH:mm
      return parts[1].substring(0, 5);
    }
    return '';
  }
}
