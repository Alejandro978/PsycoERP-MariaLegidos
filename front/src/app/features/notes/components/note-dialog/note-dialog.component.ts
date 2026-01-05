import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-dialog.component.html'
})
export class NoteDialogComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<string>();

  message = signal('');

  handleClose(): void {
    this.resetForm();
    this.onClose.emit();
  }

  handleSave(): void {
    const msg = this.message().trim();
    if (msg) {
      this.onSave.emit(msg);
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.message.set('');
  }

  get isValid(): boolean {
    return this.message().trim().length > 0;
  }
}
