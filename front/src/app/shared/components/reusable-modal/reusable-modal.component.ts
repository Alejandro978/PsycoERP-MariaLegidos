import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reusable-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reusable-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReusableModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() submitText: string = 'Guardar';
  @Input() isFormValid: boolean = false;
  @Input() showFormStatus: boolean = true;
  @Input() actionType: 'create' | 'edit' = 'create'; // Nuevo input para determinar el icono
  @Input() cancelButtonText: string | null = null; // New input for cancel session button
  @Input() deleteButtonText: string | null = null; // New input for delete session button
  @Input() isCancelled: boolean = false; // New input to show cancelled status

  @Output() onSubmit = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onCancelSession = new EventEmitter<void>(); // New output for cancel session
  @Output() onDeleteSession = new EventEmitter<void>(); // New output for delete session

  // SVG Icons for internal use
  protected readonly closeIcon = `<svg style="height: 1.25rem; width: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
  </svg>`;

  protected readonly checkIcon = `<svg style="height: 1rem; width: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
  </svg>`;

  protected readonly warningIcon = `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
  </svg>`;

  protected readonly warningAmberIcon = `<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
  </svg>`;

  protected readonly successIcon = `<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
  </svg>`;
}