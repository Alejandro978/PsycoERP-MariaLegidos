import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly MAX_TOASTS = 3;
  private readonly DEFAULT_DURATION = 4000;
  private toastCounter = 0;

  private toastsSignal = signal<ToastMessage[]>([]);

  get toasts() {
    return this.toastsSignal.asReadonly();
  }

  showSuccess(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.addToast('success', message, duration);
  }

  showError(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.addToast('error', message, duration);
  }

  showWarning(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.addToast('warning', message, duration);
  }

  showInfo(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.addToast('info', message, duration);
  }

  removeToast(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  private addToast(type: ToastMessage['type'], message: string, duration: number): void {
    const toast: ToastMessage = {
      id: `toast-${++this.toastCounter}-${Date.now()}`,
      type,
      message,
      duration,
      timestamp: Date.now()
    };

    this.toastsSignal.update(toasts => {
      const newToasts = [...toasts, toast];
      
      // Mantener solo los últimos MAX_TOASTS
      if (newToasts.length > this.MAX_TOASTS) {
        return newToasts.slice(-this.MAX_TOASTS);
      }
      
      return newToasts;
    });

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  clearAll(): void {
    this.toastsSignal.set([]);
  }
}