import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ToastComponent {
  private toastService = inject(ToastService);

  get toasts() {
    return this.toastService.toasts;
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  getToastClasses(type: ToastMessage['type']): string {
    const baseClasses = 'relative flex items-center gap-3 p-4 mb-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform translate-x-0 opacity-100';
    
    const typeClasses = {
      success: 'bg-green-50 border border-green-200 text-green-800',
      error: 'bg-red-50 border border-red-200 text-red-800',
      warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border border-blue-200 text-blue-800'
    };

    return `${baseClasses} ${typeClasses[type]}`;
  }

  getIconClasses(type: ToastMessage['type']): string {
    const baseClasses = 'h-5 w-5 flex-shrink-0';
    
    const typeClasses = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500'
    };

    return `${baseClasses} ${typeClasses[type]}`;
  }

  getCloseButtonClasses(type: ToastMessage['type']): string {
    const baseClasses = 'absolute top-2 right-2 h-4 w-4 cursor-pointer hover:opacity-70 transition-opacity';
    
    const typeClasses = {
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600'
    };

    return `${baseClasses} ${typeClasses[type]}`;
  }
}