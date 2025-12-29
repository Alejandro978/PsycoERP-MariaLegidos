import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingCount = signal(0);
  
  // Computed que indica si hay alguna operación cargando
  isLoading = computed(() => this.loadingCount() > 0);
  
  show(): void {
    this.loadingCount.update(count => count + 1);
  }
  
  hide(): void {
    this.loadingCount.update(count => Math.max(0, count - 1));
  }
  
  // Para casos específicos
  setLoading(loading: boolean): void {
    if (loading) this.show();
    else this.hide();
  }

  // Métodos legacy para compatibilidad con interceptor existente
  incrementLoading(): void {
    this.show();
  }

  decrementLoading(): void {
    this.hide();
  }

  reset(): void {
    this.loadingCount.set(0);
  }

  get isLoadingValue(): boolean {
    return this.loadingCount() > 0;
  }
}