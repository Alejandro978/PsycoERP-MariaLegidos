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
   * Format date string to full date with time
   * @param dateString Date in format "YYYY-MM-DD HH:mm:ss"
   */
  formatFullDate(dateString: string): string {
    const [datePart, timePart] = dateString.split(' ');
    const date = new Date(datePart);
    const time = timePart ? timePart.substring(0, 5) : '';

    const formattedDate = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return time ? `${formattedDate}, ${time}` : formattedDate;
  }

}
