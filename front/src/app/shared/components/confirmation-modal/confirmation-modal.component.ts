import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  templateUrl: './confirmation-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() itemName?: string;
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() confirmButtonType: 'destructive' | 'primary' = 'primary';
  @Input() isRestore: boolean = false;
  @Input() modalType: 'default' | 'whatsapp' = 'default';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  handleConfirm() {
    this.onConfirm.emit();
  }

  handleCancel() {
    this.onCancel.emit();
  }

  get isWhatsApp(): boolean {
    return this.modalType === 'whatsapp';
  }

  get confirmButtonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2';

    if (this.isWhatsApp) {
      return `${baseClasses} bg-[#25D366] text-white hover:bg-[#128C7E]`;
    } else if (this.isRestore) {
      return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
    } else if (this.confirmButtonType === 'destructive') {
      return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
    } else {
      return `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`;
    }
  }

  get modalThemeClasses(): string {
    if (this.isWhatsApp) {
      return 'border-[#25D366]/30 bg-white';
    } else if (this.isRestore) {
      return 'border-green-200 bg-white';
    } else {
      return 'border-red-200 bg-white';
    }
  }

  get iconClasses(): string {
    if (this.isWhatsApp) {
      return 'w-20 h-20 bg-[#25D366]/10 rounded-full flex items-center justify-center';
    } else if (this.isRestore) {
      return 'w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse';
    } else {
      return 'w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse';
    }
  }

  get iconColor(): string {
    if (this.isWhatsApp) {
      return 'text-[#25D366]';
    }
    return this.isRestore ? 'text-green-600' : 'text-red-600';
  }

  get titleColor(): string {
    if (this.isWhatsApp) {
      return 'text-gray-800';
    }
    return this.isRestore ? 'text-green-700' : 'text-red-700';
  }

  get decorativeLine(): string {
    if (this.isWhatsApp) {
      return 'bg-[#25D366]';
    }
    return this.isRestore ? 'bg-green-500' : 'bg-red-500';
  }

  get itemBoxClasses(): string {
    if (this.isWhatsApp) {
      return 'bg-[#25D366]/5 border border-[#25D366]/20 rounded-lg p-4';
    } else if (this.isRestore) {
      return 'bg-green-50 border border-green-200 rounded-lg p-4';
    } else {
      return 'bg-red-50 border border-red-200 rounded-lg p-4';
    }
  }

  get itemTextClasses(): string {
    if (this.isWhatsApp) {
      return 'text-gray-800 font-semibold text-lg';
    }
    return this.isRestore ? 'text-green-800 font-semibold text-lg' : 'text-red-800 font-semibold text-lg';
  }

  get itemSubtextClasses(): string {
    if (this.isWhatsApp) {
      return 'text-gray-600 text-sm mt-1';
    }
    return this.isRestore ? 'text-green-600 text-sm mt-1' : 'text-red-600 text-sm mt-1';
  }
}